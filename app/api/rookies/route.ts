import { NextResponse } from 'next/server'

export const revalidate = 86400

export async function GET() {
    const data = [
        {
            id: 'effie',
            name: 'Effie',
            genre: 'Experimental Hip-Hop',
            description: 'Hyper and experimental underground sound',
            track: 'CAN I SIP 담배',
            percent: 23,
            ticker: 'EFF',
        },
        {
            id: 'mollyyam',
            name: 'Molly Yam',
            genre: 'Alternative Trap',
            description: 'Aggressive and emotional trap style',
            track: 'Burning Slow',
            percent: 18,
            ticker: 'MLY',
        },
        {
            id: 'shinjihang',
            name: 'shinjihang',
            genre: 'Alternative Hip-Hop',
            description: 'Unique underground style',
            track: 'NIGHT CRUISE',
            percent: 11,
            ticker: 'SJH',
        },
        {
            id: 'systemseoul',
            name: 'SYSTEM SEOUL',
            genre: 'Drill / Trap',
            description: 'Cold urban drill sound',
            track: 'SEOUL CITY',
            percent: 9,
            ticker: 'SYS',
        },
        {
            id: 'nowimyoung',
            name: 'NOWIMYOUNG',
            genre: 'Boom Bap',
            description: 'Raw underground energy',
            track: 'RAW SHIT',
            percent: 15,
            ticker: 'NIY',
        },
        {
            id: 'yoondahye',
            name: 'Yoon Da Hye',
            genre: 'R&B / Soul',
            description: 'Smooth emotional vocals',
            track: 'Moonlight',
            percent: 7,
            ticker: 'YDH',
        },
    ]

    return NextResponse.json(data)
}