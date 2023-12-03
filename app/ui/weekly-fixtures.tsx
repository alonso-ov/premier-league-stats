import getFixtures from '@/app/lib/data';
import FixtureCard from '@/app/ui/fixture-card';
import type { FixtureCardProps } from '@/app/ui/fixture-card';


export default async function WeeklyFixtures() {

    let fixtures = await getFixtures();

    fixtures = fixtures.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

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