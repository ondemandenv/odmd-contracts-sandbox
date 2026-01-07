import {OdmdBuild, OdmdEnver, SRC_Rev_REF} from "@ondemandenv.dev/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import * as path from "path";

export class OdmdBuildCloudflareInfra extends OdmdBuild<OdmdEnverCloudflareInfra> {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md');
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md');

    protected _envers: Array<OdmdEnverCloudflareInfra>;
    get envers(): Array<OdmdEnverCloudflareInfra> {
        return this._envers;
    }

    private _theOne: OdmdEnverCloudflareInfra;
    get theOne(): OdmdEnverCloudflareInfra {
        return this._theOne;
    }

    protected initializeEnvers(): void {
        this._theOne = new OdmdEnverCloudflareInfra(this, this.contracts.accounts.workspace1, 'us-west-2', new SRC_Rev_REF('b', 'main'));
        this._envers = [this._theOne];
    }

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'cloudflareInfraPulumi', scope.githubRepos.cloudflare);
    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }

}

export class OdmdEnverCloudflareInfra extends OdmdEnver<OdmdBuild<OdmdEnverCloudflareInfra>> {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md');

    readonly owner: OdmdBuildCloudflareInfra

    constructor(owner: OdmdBuildCloudflareInfra, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
    }
}
