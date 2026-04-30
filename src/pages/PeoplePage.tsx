import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AppShell } from '@/layouts/AppShell'
import { ContainerHeader } from '@/components/ContainerHeader'
import { PersonRow } from '@/components/ui/PersonRow'
import { Divider } from '@/components/ui/Divider'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StarredSection, type StarredItem } from '@/components/ui/StarredSection'
import { useDmConversationView } from '@/components/views/useDmConversationView'
import { useStarred } from '@/lib/starred'
import { useDebug } from '@/lib/debug'
import { dmHasUnread } from '@/data/dmData'

const DMS = [
  { id: 1, name: 'Alice Johnson',  isUnread: false },
  { id: 2, name: 'Daniel Stanton', isUnread: false },
  { id: 3, name: 'Hallie Pratt',   isUnread: false },
  { id: 4, name: 'Greg Bothman',   isUnread: false },
  { id: 5, name: 'Juan Foley',     isUnread: false },
  { id: 6, name: 'Amie Miles',     isUnread: false },
  { id: 7, name: 'Zack Bright',    isUnread: false },
]

const TEAMS = [
  { id: 10, name: 'Account Management' },
  { id: 11, name: 'Designers' },
  { id: 12, name: 'Engineering' },
  { id: 13, name: 'HR / People Ops' },
  { id: 14, name: 'Product Management' },
  { id: 15, name: 'Sales' },
]

const ALL_ITEMS = [...DMS, ...TEAMS]
const DM_IDS = new Set(DMS.map((d) => d.id))

export function PeoplePage() {
  const { id: routeId } = useParams<{ id: string }>()
  const initialId = routeId ? Number(routeId) : null
  const [selectedId, setSelectedId] = useState<number | null>(initialId)
  const [teamsExpanded, setTeamsExpanded] = useState(true)
  const { entries: starredEntries } = useStarred()
  const { state: debug } = useDebug()
  const showUnreads = debug.unreads.people

  const starredDmItems: StarredItem[] = starredEntries
    .filter((e) => e.kind === 'dm')
    .map<StarredItem>((e) => ({
      id: e.dmId,
      name: e.name,
      type: 'DM',
      avatarSrc: e.avatarSrc,
      isUnread: showUnreads && dmHasUnread(e.dmId),
    }))
    .sort((a, b) => Number(b.isUnread) - Number(a.isUnread))

  const starredDmIds = new Set(starredDmItems.map((s) => s.id))
  // Sort: unread first when toggle on, otherwise input order. Then drop starred DMs.
  const sortedDms = showUnreads
    ? [...DMS].sort((a, b) => Number(dmHasUnread(b.id)) - Number(dmHasUnread(a.id)))
    : DMS
  const visibleDms = sortedDms.filter((dm) => !starredDmIds.has(dm.id))

  useEffect(() => {
    if (routeId) setSelectedId(Number(routeId))
  }, [routeId])

  const selectedItem = selectedId ? ALL_ITEMS.find((i) => i.id === selectedId) : null
  const isDm = selectedId != null && DM_IDS.has(selectedId)

  const dmView = useDmConversationView({
    dmId: isDm ? selectedId : null,
    dmName: isDm ? selectedItem?.name : undefined,
    showUnreads,
  })

  return (
    <AppShell
      leftPanel={
        <div className="flex flex-col h-full">
          <ContainerHeader
            title="People"
            prop1stAction
            prop1stActionTooltip="New conversation"
            prop2ndAction
            prop2ndActionTooltip="Sort by"
          />
          <div className="flex-1 overflow-y-auto pt-4 pb-3 px-3 flex flex-col gap-1">
            <StarredSection
              items={starredDmItems}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            <Divider className="my-2" />

            {visibleDms.map((dm) => (
              <PersonRow
                key={dm.id}
                name={dm.name}
                type="DM"
                isUnread={showUnreads && dmHasUnread(dm.id)}
                isSelected={selectedId === dm.id}
                onClick={() => setSelectedId(dm.id)}
              />
            ))}

            <Divider className="my-2" />

            <SectionHeader
              title="Teams"
              chevron
              isExpanded={teamsExpanded}
              onToggle={() => setTeamsExpanded((v) => !v)}
            />

            {teamsExpanded && TEAMS.map((t) => (
              <PersonRow
                key={t.id}
                name={t.name}
                type="team"
                isSelected={selectedId === t.id}
                onClick={() => setSelectedId(t.id)}
              />
            ))}
          </div>
        </div>
      }
      rightPanel={dmView.rightPanel}
      threadPanel={dmView.threadPanel}
    />
  )
}
