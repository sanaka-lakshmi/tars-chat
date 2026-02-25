import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export function useGlobalTypingIndicators(currentUserId: string) {
  // Use a single query to get all typing indicators for all conversations
  const typingByConversation = useQuery(api.typing.getAllTypingIndicators, { userId: currentUserId as Id<'users'> }) || {}
  return typingByConversation
}
