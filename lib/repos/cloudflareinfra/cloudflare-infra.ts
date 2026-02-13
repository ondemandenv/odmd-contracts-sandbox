import {OdmdBuild, OdmdEnver, SRC_Rev_REF, IOdmdEnver} from "@ondemandenv.dev/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import * as path from "path";

export interface CloudflarePagesConfig {
    projectName: string;
    buildCommand?: string;
    buildOutputDir?: string;
    customDomain?: string;
}

export interface CloudflareFeatureSet {
    emailRouting?: boolean;
    pages?: CloudflarePagesConfig;
    r2?: { bucketName: string };
    d1?: { databaseName: string };
    kv?: { namespaceName: string };
}

export class OdmdBuildCloudflareInfra extends OdmdBuild<OdmdEnverCloudflareInfra> {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md');
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md');

    protected _envers: Array<OdmdEnverCloudflareInfra>;
    get envers(): Array<OdmdEnverCloudflareInfra> {
        return this._envers;
    }

    private _newidClick: OdmdEnverCloudflareInfra;
    get newidClick(): OdmdEnverCloudflareInfra {
        return this._newidClick;
    }

    private _ondemandenvDev: OdmdEnverCloudflareInfra;
    get ondemandenvDev(): OdmdEnverCloudflareInfra {
        return this._ondemandenvDev;
    }

    private _pubanatomyOrg: OdmdEnverCloudflareInfra;
    get pubanatomyOrg(): OdmdEnverCloudflareInfra {
        return this._pubanatomyOrg;
    }

    private _odmdUk: OdmdEnverCloudflareInfra;
    get odmdUk(): OdmdEnverCloudflareInfra {
        return this._odmdUk;
    }

    protected initializeEnvers(): void {
        this._newidClick = new OdmdEnverCloudflareInfra(
            this, this.contracts.accounts.workspace1, 'us-west-2',
            new SRC_Rev_REF('b', 'main'),
            'newid.click', 'CLOUDFLARE_ZONE_ID_NEWID',
            {emailRouting: true}
        );

        this._ondemandenvDev = new OdmdEnverCloudflareInfra(
            this, this.contracts.accounts.workspace1, 'us-west-2',
            new SRC_Rev_REF('b', 'ondemandenv-dev'),
            'ondemandenv.dev', 'CLOUDFLARE_ZONE_ID_ODMD_DEV',
            {emailRouting: true}
        );

        this._pubanatomyOrg = new OdmdEnverCloudflareInfra(
            this, this.contracts.accounts.workspace1, 'us-west-2',
            new SRC_Rev_REF('b', 'pubanatomy'),
            'pubanatomy.org', 'CLOUDFLARE_ZONE_ID_PUBANATOMY',
            {emailRouting: true}
        );

        this._odmdUk = new OdmdEnverCloudflareInfra(
            this, this.contracts.accounts.workspace1, 'us-west-2',
            new SRC_Rev_REF('b', 'odmd-uk'),
            'odmd.uk', 'CLOUDFLARE_ZONE_ID_ODMD_UK',
            {emailRouting: true}
        );

        this._envers = [this._newidClick, this._ondemandenvDev, this._pubanatomyOrg, this._odmdUk];
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

    readonly owner: OdmdBuildCloudflareInfra;

    readonly domainName: string;
    readonly zoneIdSecretName: string;
    readonly features: CloudflareFeatureSet;

    constructor(
        owner: OdmdBuildCloudflareInfra,
        targetAWSAccountID: string,
        targetAWSRegion: string,
        targetRevision: SRC_Rev_REF,
        domainName: string,
        zoneIdSecretName: string,
        features: CloudflareFeatureSet
    ) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.domainName = domainName;
        this.zoneIdSecretName = zoneIdSecretName;
        this.features = features;
    }

    generateDynamicEnver(rev: SRC_Rev_REF, newInst: IOdmdEnver | undefined = undefined): IOdmdEnver {
        if (!newInst) {
            newInst = new OdmdEnverCloudflareInfra(
                this.owner as OdmdBuildCloudflareInfra,
                this.targetAWSAccountID,
                this.targetAWSRegion,
                rev,
                this.domainName,
                this.zoneIdSecretName,
                this.features
            ) as unknown as IOdmdEnver;
        }
        return super.generateDynamicEnver(rev, newInst);
    }
}
