import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SettingsObject {
    [key: string]: string
}

export async function GET() {
    try {
        const rows = await prisma.setting.findMany()

        const settings = rows.reduce((acc: SettingsObject, setting) => {
            acc[setting.key] = setting.value
            return acc
        }, {})

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const settings: SettingsObject = await request.json()

        for (const [key, value] of Object.entries(settings)) {
            await prisma.setting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
