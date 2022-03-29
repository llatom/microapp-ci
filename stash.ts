import WeappCI from './platform/weapp-ci'
import TTCI from './platform/tt-ci'
import AlipayCI from './platform/alipay-ci'
import SwanCI from './platform/swan-ci'
import { WeappConfig, DEPLOY_CONFIG_DATA } from './types/base-ci'
import { preview, Project, upload } from 'miniprogram-ci';
import { IInnerUploadResult } from 'miniprogram-ci/dist/@types/ci/upload';
import { printLog } from './utils/console';
import { bytesToSize, checkDeployConfigFile, getProjectConfig, writeDeployConfigFile } from './utils/fs';
import { getLatestCommitMsg } from './utils/utils';
import Table from 'cli-table3';
const rootPath = process.cwd()

export class MiniAppCi {
    constructor( private deployConfig: DEPLOY_CONFIG_DATA ) {
        this.initProject();
    }

    private initProject() {
        if (!this.deployConfig) {
            return;
        }
        const projectConfig = this.deployConfig[this.deployConfig.platform]
        if (!projectConfig) {
            printLog.error(`can't access project.config.json, please check it`);
            return;
        }
        this.project = new Project({
            appid:projectConfig.appid,
            projectPath: projectConfig.projectPath,
            privateKeyPath: projectConfig.privateKeyPath,
            ignores: ['node_modules/**/*'],
          });
    }

    // async open (){
    //     const deployConfig = this.deployConfig as DEPLOY_CONFIG_DATA;
    //     const rootPath = this.rootPath as string;
    //     let ci
    //     ci = new WeappCI(deployConfig, rootPath)
    //     ci.open()
    // }

    async upload() {
        const projectConfig = this.deployConfig[this.deployConfig.platform]
        if (!this.deployConfig) {
            return;
        }
        if (!projectConfig) {
            return;
        }
        printLog.pending('Getting latest commit messsage');

        const { version, desc } = this.deployConfig;

        const os = require('os');
        const packageJson = require(`${rootPath}/package.json`);
        const info = await getLatestCommitMsg(rootPath);

        printLog.ok('Get latest commit messsage succeed');
            
        try {
            const uploadResult = await upload({
                project: this.project,
                version: version || packageJson.version,
                desc: desc || info,
                setting: {
                    ...projectConfig,
                    minify: true
                },
                onProgressUpdate: this.handleProgress,
                threads: os.cpus.length
            });

            const resultTable = this.handleUploadResult(uploadResult);
            
            printLog.info(`Below is the uploaded package information table.\n${resultTable}`);
        } catch (error: any) {
            printLog.error(error.message);
        } finally {
            process.exit(1);
        }
    }



    private handleUploadResult(result: IInnerUploadResult) {
        const { subPackageInfo = [] } = result;

        const packageTable = new Table({
            head: ['PackageType', 'Size'],
        });

        const packageTypeMap: any = {
            '__FULL__': 'all',
            '__APP__': 'main'
        }

        subPackageInfo.forEach(packageInfo => {
            const formatSize = bytesToSize(packageInfo.size);
            packageTable.push([packageTypeMap[packageInfo.name] || 'subpackage', formatSize]);
        });

        return packageTable.toString();
    }

    private handleProgress(taskStatus: any) {
        let msg = taskStatus._msg;

        if (msg) {
            const isWxmlTask = /(\/|json|wxss|wxml|js)/.test(msg);
            msg = isWxmlTask ? `[Compile] ${msg}` : msg;

            if (taskStatus._status === 'done') {
                printLog.ok(msg);
            } else {
                printLog.pending(msg);
            }
        }
    }


}