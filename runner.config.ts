import { RunnerConfig } from './helpers/utils.ts';

export const config: RunnerConfig = {
  useMinecraftPreview: true,
  packs: {
    description: 'starter ts deno',
    version: [0, 1, 0],
    min_engine_version: [1, 19, 40],
    resource: {
      name: 'rp-starter-ts',
      uuid: '1f0f8d31-f4a2-4962-8e50-dec1279e37f1',
      modules: {
        '0c2b861b-bdeb-4348-9765-ddb2097c02d6': {
          type: 'resources',
          version: [1, 0, 0]
        }
      }
    },
    behavior: {
      name: 'bp-starter-ts',
      uuid: '50ce53a5-7194-4a96-9c88-333ba5b33da4',
      modules: {
        'c78daf96-81e8-4e9d-90d3-75ec787ac180': {
          type: 'data',
          version: [0, 1, 0]
        },
        'a2ee339c-205c-46d6-8853-04ceb63c1b8c': {
          type: 'script',
          language: 'javascript',
          version: [1, 0, 0],
          entry: 'scripts/main.js'
        }
      },
      capabilities: ['script_eval'],
      dependencies: {
        '@minecraft/server': '1.1.0-beta',
        '@minecraft/server-ui': '1.0.0-beta'
      }
    }
  }
};
