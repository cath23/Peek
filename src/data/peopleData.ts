export interface Person {
  id: string
  name: string
  role: string
  avatarSrc?: string
}

export const PEOPLE: Person[] = [
  { id: 'alice', name: 'Alice Johnson', role: 'Product Designer' },
  { id: 'bob', name: 'Bob Smith', role: 'Engineering Lead' },
  { id: 'carol', name: 'Carol White', role: 'Customer Success' },
  { id: 'david', name: 'David Chen', role: 'Frontend Engineer' },
  { id: 'emma', name: 'Emma Wilson', role: 'Product Manager' },
  { id: 'frank', name: 'Frank Lee', role: 'Backend Engineer' },
]
