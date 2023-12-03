import Image from 'next/image';
import FixtureCard from '@/app/ui/fixture-card';
import WeeklyFixtures from '@/app/ui/weekly-fixtures';
export default async function Home() {

  return (
    <div className="flex w-full h-full py-8">
      <WeeklyFixtures />
    </div>
  )
}