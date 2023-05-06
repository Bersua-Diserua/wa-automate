import { z } from "zod"
import { api } from "."

export const rsvpRecordStatus = z.enum([
  "TICKET", // Generate ticket
  "SUBMISSION", // User do submission
  "SUBMISSION.APPROVE", // Submission user already approved by admin
  "RESOLVE", // Payment has received by admin
  "REJECT", // Rsvp submission has rejected by admin
])

const schema = z.array(
  z.object({
    recordId: z.string(),
    seat: z.number(),
    status: rsvpRecordStatus,
    details: z.object({
      status: rsvpRecordStatus,
      rejectedReason: z.string().nullable(),
      capacity: z.string(),
      capacityNumber: z.number(),
      date: z.string(),
      email: z.string(),
      name: z.string(),
      phoneNumber: z.string(),
      seatIndex: z.number(),
      time: z.string(),
      transaction: z.object({
        date: z.string().nullable(),
        amount: z.number(),
      }),
      customer: z.object({
        name: z.null(),
        phoneNumber: z.string(),
        id: z.string(),
      }),
    }),
  })
)

export async function getRsvpManagement(isoDate: string) {
  const { data } = await api.get("/rsvp/management", {
    params: { date: isoDate },
  })

  const validateRecords = schema.safeParse(data.payload.records)
  if (!validateRecords.success) {
    console.error(validateRecords.error)
    throw validateRecords.error
  }

  return {
    records: validateRecords.data,
  }
}
