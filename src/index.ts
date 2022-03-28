import 'module-alias/register';

import Orchestrator from '@/Orchestrator';

export default function run(source: string, dest: string) {
  new Orchestrator(source, dest).run();
}
