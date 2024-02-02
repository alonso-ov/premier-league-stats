import Image from 'next/image';
import clsx from 'clsx';


export interface FixtureCardProps {
    fixture_id: number;
    date: string;
    time: string;
    status: string;
    home: string;
    home_id: number;
    home_score: number;
    away: string;
    away_id: number;
    away_score: number;
    venue: string;
}


export default async function FixtureCard({ fixture_id, date, time, status, home, home_id, home_score, away, away_id, away_score, venue }: FixtureCardProps) {

    const dateObj = new Date(date);

    // Format the date as mm/dd/yy
    const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

    // Format the time as hh:mm
    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const timeZoneAbbr = dateObj.toLocaleTimeString('en-us', {timeZoneName: 'short'}).split(' ')[2];

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
            <div>
                <p><span className={statusClasses}>{status == 'Not Started' ? 'Upcoming' : status}</span></p>
                {status != 'Not Started' && <p className="font-bold">{home_score} - {away_score}</p>}
                <p>{formattedDate} @ {formattedTime} {timeZoneAbbr}</p>
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