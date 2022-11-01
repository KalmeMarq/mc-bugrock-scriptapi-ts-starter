import { symbolName } from 'https://esm.sh/v96/typescript@4.8.4/lib/typescript.d.ts';

export async function exists(path: string, type?: 'dir' | 'file'): Promise<boolean> {
  try {
    const stat = await Deno.stat(path);
    return type === 'dir' ? stat.isDirectory : type === 'file' ? stat.isFile : true;
  } catch (e) {
    return false;
  }
}

export function existsSync(path: string, type?: 'dir' | 'file'): boolean {
  try {
    const stat = Deno.statSync(path);
    return type === 'dir' ? stat.isDirectory : type === 'file' ? stat.isFile : true;
  } catch (e) {
    return false;
  }
}

type Module =
  | {
      type: 'script';
      language: 'javascript';
      version: [number, number, number];
      entry: string;
    }
  | {
      type: 'data' | 'resources';
      version: [number, number, number];
    };

export interface RunnerConfig {
  useMinecraftPreview: boolean;
  packs: {
    version: [number, number, number];
    min_engine_version: [number, number, number];
    authors?: string[];
    license?: string;
    description?: string;
    resource: {
      name: string;
      folderName?: string;
      uuid: string;
      modules: { [uuid: string]: Module };
    };
    behavior: {
      name: string;
      folderName?: string;
      uuid: string;
      modules: { [uuid: string]: Module };
      capabilities?: string[];
      dependencies?: Record<string, string>;
    };
  };
  dedicatedServer?: {
    serverPath: string;
  };
}

export interface ResourceManifest {
  format_version: number;
  header: {
    name: string;
    description: string;
    uuid: string;
    version: [number, number, number];
    min_engine_version: [number, number, number];
  };
  modules: (
    | {
        type: 'data' | 'resources';
        version: [number, number, number];
        uuid: string;
      }
    | {
        type: 'script';
        language: 'javascript';
        entry: string;
        version: [number, number, number];
        uuid: string;
      }
  )[];
  metadata?: {
    authors?: string[];
    license?: string;
  };
}

export interface BehaviorManifest {
  format_version: number;
  header: {
    name: string;
    description: string;
    uuid: string;
    version: [number, number, number];
    min_engine_version: [number, number, number];
  };
  modules: (
    | {
        type: 'data' | 'resources';
        version: [number, number, number];
        uuid: string;
      }
    | {
        type: 'script';
        language: 'javascript';
        entry: string;
        version: [number, number, number];
        uuid: string;
      }
  )[];
  dependencies?: {
    module_name: string;
    version: string;
  }[];
  metadata?: {
    authors?: string[];
    license?: string;
  };
}
