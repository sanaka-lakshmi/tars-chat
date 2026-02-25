import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId)).first()
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,
        email: args.email,
        isOnline: true,
        lastSeen: Date.now(),
      })
      // Ensure other users are marked offline when this user syncs
      const allUsers = await ctx.db.query('users').collect()
      const others = allUsers.filter(u => u.clerkId !== args.clerkId)
      for (const o of others) {
        await ctx.db.patch(o._id, { isOnline: false })
      }
      return existing._id
    } else {
      const id = await ctx.db.insert('users', {
        clerkId: args.clerkId,
        name: args.name,
        imageUrl: args.imageUrl,
        email: args.email,
        isOnline: true,
        lastSeen: Date.now(),
      })
      // After inserting a new user, ensure other users are marked offline
      const allUsers = await ctx.db.query('users').collect()
      const others = allUsers.filter(u => u.clerkId !== args.clerkId)
      for (const o of others) {
        await ctx.db.patch(o._id, { isOnline: false })
      }
      return id
    }
  },
})

export const setOnline = mutation({
  args: { clerkId: v.string(), online: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId)).first()
    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: args.online,
        lastSeen: Date.now(),
      })
    }
  },
})

export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})