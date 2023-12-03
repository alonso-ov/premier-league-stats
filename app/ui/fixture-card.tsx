
export interface FixtureCardProps {
    fixture_id: number;
    date: string;
    time: string;
    status: string;
    home: string;
    away: string;
    venue: string;
}

export default function FixtureCard({ fixture_id, date, time, status, home, away, venue }: FixtureCardProps) {
    return (
        <div className="flex min-w-fit w-[600px] justify-between p-3 bg-white border rounded-3xl">
            <div className="home">
                <p>Home: {home}</p>
            </div>
            <div className="info">
                <p>Date: {date}</p>
                <p>Time: {time}</p>
                <p>Status: {status}</p>
                <p>Venue: {venue}</p>
            </div>
            <div className="away">
                <p>Away: {away}</p>
            </div>
        </div>
    );
}