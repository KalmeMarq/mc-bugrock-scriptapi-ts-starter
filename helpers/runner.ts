import ts from 'typescript';
import { config as runnerConfig } from '../runner.config.ts';
import * as fs from 'fs';
import { exists, existsSync } from './utils.ts';
import { profileEnd, profileStart } from './profiler.ts';
import { buildBehaviorManifest, buildResourceManifest } from './manifest.ts';

const isBuild = Deno.args.includes('--build');
const isWatch = Deno.args.includes('--watch');
const isDeploy = Deno.args.includes('--deploy');
const isServe = Deno.args.includes('--serve');

const MINECRAFT_PACKAGE_NAME = 'MinecraftUWP_8wekyb3d8bbwe';
const MINECRAFT_PREVIEW_PACKAGE_NAME = 'MinecraftWindowsBeta_8wekyb3d8bbwe';
const mcDir = `${Deno.env.get('LOCALAPPDATA')}/Packages/Microsoft.${runnerConfig.useMinecraftPreview ? MINECRAFT_PREVIEW_PACKAGE_NAME : MINECRAFT_PACKAGE_NAME}/LocalState/games/com.mojang`;

async function cleanBuild() {
  profileStart('clean_build');

  if (await exists('build/behavior_pack')) {
    await Deno.remove('build/behavior_pack', { recursive: true });
  }

  if (await exists('build/resource_pack')) {
    await Deno.remove('build/resource_pack', { recursive: true });
  }

  profileEnd('clean_build');
}

async function copyContent() {
  profileStart('copy_content');

  await fs.copy('packs/behavior', 'build/behavior_pack');
  await fs.copy('packs/resource', 'build/resource_pack');

  profileEnd('copy_content');
}

async function generateManifests() {
  profileStart('generate_manifests');

  await Deno.writeTextFile('build/behavior_pack/manifest.json', JSON.stringify(buildBehaviorManifest(runnerConfig), null, 2));
  await Deno.writeTextFile('build/resource_pack/manifest.json', JSON.stringify(buildResourceManifest(runnerConfig), null, 2));

  profileEnd('generate_manifests');
}

async function generateTexturesList() {
  profileStart('generate_textures_list');

  const txrPaths: string[] = [];

  const visit = async (dirPath: string) => {
    for await (const entry of Deno.readDir(dirPath)) {
      if (entry.isFile && entry.name.endsWith('.png') && !(dirPath === 'build/resource_pack' && entry.name === 'pack_icon.png')) {
        txrPaths.push(dirPath.replace('build/resource_pack', '') + '/' + entry.name);
      } else if (entry.isDirectory) {
        await visit(dirPath + '/' + entry.name);
      }
    }
  };

  await visit('build/resource_pack');

  await Deno.mkdir('build/resource_pack/textures', { recursive: true });

  await Deno.writeTextFile(
    'build/resource_pack/textures/textures_list.json',
    JSON.stringify(
      txrPaths.map((p) => (p.startsWith('/') ? p.substring(1) : p)),
      null,
      2
    )
  );

  profileEnd('generate_textures_list');
}

async function compileScripts() {
  profileStart('compile_scripts');

  const filePaths: string[] = [];

  await Deno.mkdir('build/behavior_pack/scripts', { recursive: true });

  const visit = async (dirPath: string) => {
    for await (const entry of Deno.readDir(dirPath)) {
      if (entry.isFile && entry.name.endsWith('.ts')) {
        filePaths.push(dirPath + '/' + entry.name);
      } else if (entry.isDirectory) {
        await visit(dirPath + '/' + entry.name);
      }
    }
  };

  await visit('scripts');

  for (const script of filePaths) {
    const output = ts
      .transpileModule(await Deno.readTextFile(script), {
        compilerOptions: {
          module: ts.ModuleKind.ES2020,
          moduleResolution: ts.ModuleResolutionKind.NodeJs,
          lib: ['es2020', 'dom'],
          strict: true,
          target: ts.ScriptTarget.ES2020,
          noImplicitAny: true
        }
      })
      .outputText.replace(/(?<=(import(\s+.+\s+from)?\s+['|\"]))(.+\.ts)(?=(['|\"]))/g, (a, b, c, d) => {
        return a.replace('.ts', '.js');
      });

    await Deno.writeTextFile('build/behavior_pack/' + script.replace('.ts', '.js'), output);
  }

  profileEnd('compile_scripts');
}

async function cleanLocalMC() {
  profileStart('clean_localmc');

  const bpFolderPath = `${mcDir}/development_behavior_packs/${runnerConfig.packs.behavior.folderName ?? runnerConfig.packs.behavior.name}`;
  const rpFolderPath = `${mcDir}/development_resource_packs/${runnerConfig.packs.resource.folderName ?? runnerConfig.packs.resource.name}`;

  if (await exists(bpFolderPath)) {
    await Deno.remove(bpFolderPath, { recursive: true });
  }

  if (await exists(rpFolderPath)) {
    await Deno.remove(rpFolderPath, { recursive: true });
  }

  profileEnd('clean_localmc');
}

async function deployLocalMCPacks() {
  if (!(await exists('build'))) {
    console.log('%cYou need to build packs first!', 'color: red;');
    Deno.exit(1);
  }

  await cleanLocalMC();

  profileStart('deploy_localmc_packs');

  const bpFolderPath = `${mcDir}/development_behavior_packs/${runnerConfig.packs.behavior.folderName ?? runnerConfig.packs.behavior.name}`;
  const rpFolderPath = `${mcDir}/development_resource_packs/${runnerConfig.packs.resource.folderName ?? runnerConfig.packs.resource.name}`;

  await fs.copy('build/behavior_pack', bpFolderPath);
  await fs.copy('build/resource_pack', rpFolderPath);

  profileEnd('deploy_localmc_packs');
}

async function build() {
  await cleanBuild();
  await copyContent();
  await generateManifests();
  await generateTexturesList();
  await compileScripts();
}

if (isBuild) {
  await build();
} else if (isDeploy) {
  await deployLocalMCPacks();
} else if (isWatch) {
  const watcher = Deno.watchFs(['scripts', 'packs/behavior', 'packs/resource']);

  await build();
  await deployLocalMCPacks();

  for await (const _ of watcher) {
    await build();
    await deployLocalMCPacks();
  }
} else if (isServe) {
  console.log('%cNot implemented yet', 'color: red;');
  Deno.exit(1);
}
