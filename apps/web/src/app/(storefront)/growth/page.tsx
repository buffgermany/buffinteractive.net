import { Metadata } from 'next';
import { GrowthClient } from '@/components/growth/GrowthClient';

export const metadata: Metadata = {
  title: 'The Growth',
  description: 'We tear down your funnels, analyze unit economics, and build a customized growth blueprint.',
};

export default function GrowthPage() {
  return <GrowthClient />;
}
