import 'module-alias/register';

import Orchestrator from '@/Orchestrator';

export default async function run(source: string, dest: string) {
  await new Orchestrator(source, dest).run();
}
