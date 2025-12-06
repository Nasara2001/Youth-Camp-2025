// Data types for the camp registration system

export interface Room {
  id: string
  name: string
  gender: "male" | "female"
  occupants: string[] // participant IDs
}

export interface Community {
  id: string
  name: string
}

export interface Group {
  id: string
  name: string
  members: string[] // participant IDs
}

export interface Participant {
  id: string
  name: string
  gender: "male" | "female"
  community: string
  registrationFee: number
  roomId?: string
  groupId?: string
  registeredAt: string
  reported: "reported" | "not reported"
}

export interface CampData {
  rooms: Room[]
  communities: Community[]
  groups: Group[]
  participants: Participant[]
}
