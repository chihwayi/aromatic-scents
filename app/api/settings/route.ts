import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Define the setting type from your database
interface Setting {
    key: string
    value: string
    updated_at?: string
}

// Define the settings object type
interface SettingsObject {
    [key: string]: string
}

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')

        if (error) throw error

        // Convert to key-value object for easier use
        const settings = data.reduce((acc: SettingsObject, setting: Setting) => {
            acc[setting.key] = setting.value
            return acc
        }, {} as SettingsObject)

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

        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            const { error } = await supabase
                .from('settings')
                .upsert({
                    key,
                    value: value as string,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'key'
                })

            if (error) throw error
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