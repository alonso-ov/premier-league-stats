import getFixtures from '@/app/lib/data';
import FixtureCard from '@/app/ui/fixture-card';
import type { FixtureCardProps } from '@/app/ui/fixture-card';

export default async function WeeklyFixtures() {

    let fixtures = await getFixtures();
    fixtures = fixtures.sort((a: Date, b: Date) => new Date(a.date) - new Date(b.date));

    return (
        <div className="flex flex-col items-center justify-center w-screen space-y-4">
            {fixtures.map((fixture: FixtureCardProps) => (
                <FixtureCard
                    key={fixture.fixture_id}
                    {...fixture}
                />
            ))}
        </div>
    );
}