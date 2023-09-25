import {Config} from "@backstage/config";
import {Logger} from "winston";
import os from "os";
import fs from "fs-extra";

export async function getWorkingDirectory(config: Config, logger: Logger): Promise<string> {
    if (!config.has('backend.workingDirectory')) {
    return os.tmpdir();
    }

    const workingDirectory = config.getString('backend.workingDirectory');
    try {
        // Check if working directory exists and is writable
        await fs.access(workingDirectory, fs.constants.F_OK | fs.constants.W_OK);
        logger.info(`using working directory: ${workingDirectory}`);
    } catch (err: any) {
        logger.error(
            `working directory ${workingDirectory} ${
                err.code === 'ENOENT' ? 'does not exist' : 'is not writable'
            }`,
        );
        throw err;
    }
    return workingDirectory;
}