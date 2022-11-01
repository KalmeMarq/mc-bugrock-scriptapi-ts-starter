import { BehaviorManifest, ResourceManifest, RunnerConfig } from './utils.ts';

export function buildResourceManifest(runnerConfig: RunnerConfig): ResourceManifest {
  const manifest: ResourceManifest = {
    format_version: 2,
    header: {
      name: runnerConfig.packs.resource.name,
      description: runnerConfig.packs.description ?? '',
      uuid: runnerConfig.packs.resource.uuid,
      version: runnerConfig.packs.version,
      min_engine_version: runnerConfig.packs.min_engine_version
    },
    modules: []
  };

  for (const [uuid, module] of Object.entries(runnerConfig.packs.resource.modules)) {
    manifest.modules.push({
      ...module,
      uuid
    });
  }

  if (runnerConfig.packs.authors || runnerConfig.packs.license) {
    manifest.metadata = {
      authors: runnerConfig.packs.authors,
      license: runnerConfig.packs.license
    };
  }

  return manifest;
}

export function buildBehaviorManifest(runnerConfig: RunnerConfig): BehaviorManifest {
  const manifest: BehaviorManifest = {
    format_version: 2,
    header: {
      name: runnerConfig.packs.behavior.name,
      description: runnerConfig.packs.description ?? '',
      uuid: runnerConfig.packs.behavior.uuid,
      version: runnerConfig.packs.version,
      min_engine_version: runnerConfig.packs.min_engine_version
    },
    modules: []
  };

  for (const [uuid, module] of Object.entries(runnerConfig.packs.behavior.modules)) {
    manifest.modules.push({
      ...module,
      uuid
    });
  }

  if (runnerConfig.packs.behavior.dependencies) {
    manifest.dependencies = Object.entries(runnerConfig.packs.behavior.dependencies).map(([name, version]) => {
      return {
        module_name: name,
        version
      };
    });
  }

  if (runnerConfig.packs.authors || runnerConfig.packs.license) {
    manifest.metadata = {
      authors: runnerConfig.packs.authors,
      license: runnerConfig.packs.license
    };
  }

  return manifest;
}
