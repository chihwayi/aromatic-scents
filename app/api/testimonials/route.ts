import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function toDTO(t: { id: string; name: string; location: string; stars: number; text: string; orderIndex: number; isActive: boolean }) {
  return {
    id: t.id,
    name: t.name,
    location: t.location,
    stars: t.stars,
    text: t.text,
    order_index: t.orderIndex,
    is_active: t.isActive,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === '1'

    const testimonials = await prisma.testimonial.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { orderIndex: 'asc' },
    })

    return NextResponse.json(testimonials.map(toDTO))
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, location, stars, text, order_index, is_active } = await request.json()

    if (!name || !location || !text) {
      return NextResponse.json({ error: 'Name, location and text are required' }, { status: 400 })
    }

    const created = await prisma.testimonial.create({
      data: {
        name,
        location,
        stars: stars ?? 5,
        text,
        orderIndex: order_index ?? 0,
        isActive: is_active ?? true,
      },
    })

    return NextResponse.json(toDTO(created))
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, name, location, stars, text, order_index, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 })
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        location,
        stars,
        text,
        orderIndex: order_index,
        isActive: is_active,
      },
    })

    return NextResponse.json(toDTO(updated))
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Testimonial ID is required' }, { status: 400 })
    }

    await prisma.testimonial.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}
