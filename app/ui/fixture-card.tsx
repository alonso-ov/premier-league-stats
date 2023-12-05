import Image from 'next/image';
import clsx from 'clsx';

export interface FixtureCardProps {
    fixture_id: number;
    date: string;
    time: string;
    status: string;
    home: string;
    home_id: number;
    away: string;
    away_id: number;
    venue: string;
}


export default function FixtureCard({ fixture_id, date, time, status, home, home_id, away, away_id, venue }: FixtureCardProps) {

    // Convert date to "<day of the week> - <month> - <day of the month>"
    const dateObj2 = new Date(date + 'T00:00');
    const formattedDate = dateObj2.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Convert London time to local time
    const dateObj = new Date(`1970-01-01T${time}.000Z`);
    const formatter = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' });
    const localTimeWithZone = formatter.format(dateObj);

    const statusClasses = clsx(
        'font-bold',
        {
            'text-green-600': status === 'Match Finished',
            'text-yellow-600': status === 'Not Started',
        }
    );

    const imageSize = 100;

    return (
        <div className='grid grid-cols-3 md:w-[900px] p-3 bg-white border rounded-3xl [&>*]:text-center items-center justify-center'>
            <div>
                <div>
                    <span className="font-bold">Home</span>
                    <div className='flex justify-center m-2'>
                        <Image
                            src={`https://media-4.api-sports.io/football/teams/${home_id}.png`}
                            height={imageSize}
                            width={imageSize}
                            alt={`${home_id} logo`}
                        />
                    </div>
                </div>
            </div>
            <div className=''>
                <p><span className={statusClasses}>{status}</span></p>
                <p>{formattedDate} @ {localTimeWithZone}</p>
                <p>{venue}</p>
            </div>
            <div>
                <div>
                    <span className="font-bold">Away</span>
                    <div className='flex justify-center m-2'>
                        <Image
                            src={`https://media-4.api-sports.io/football/teams/${away_id}.png`}
                            height={imageSize}
                            width={imageSize}
                            alt={`${away} logo`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}