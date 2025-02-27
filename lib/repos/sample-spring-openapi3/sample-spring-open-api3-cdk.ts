import {
    IOdmdEnver,
    KubeCtlThruCentral,
    OdmdBuild,
    OdmdCrossRefConsumer, OdmdCrossRefProducer,
    OdmdEnverCdk, OdmdEnverCtnImg,
    OdmdEnverEksCluster,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class SampleSpringOpenApi3CdkEnver extends OdmdEnverCdk implements KubeCtlThruCentral {
    constructor(owner: SampleSpringOpenApi3Cdk, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.appImgRepoRef = new OdmdCrossRefConsumer(this, 'appImgRefProducer',
            owner.contracts.springOpen3Img.theOne.ctnImgRefProducer)

        this.appImgLatestRef = new OdmdCrossRefConsumer(this, 'appLatestRefProducer',
            owner.contracts.springOpen3Img.theOne.ctnImgRefProducer.latestSha)
        this.apiEndpoint = new OdmdCrossRefProducer<SampleSpringOpenApi3CdkEnver>(this, 'endpoint', {
            children: [
                {pathPart: 'api-doc'},
                {pathPart: 'swagger-ui'}
            ]
        })
        this.userEnver = this;
        this.targetNamespace = this.node.id
        this.targetEksCluster = owner.contracts.eksCluster!.envers[0]
    }

    userEnver: IOdmdEnver;
    targetNamespace: string;
    targetEksCluster: OdmdEnverEksCluster;

    readonly appImgRepoRef: OdmdCrossRefConsumer<SampleSpringOpenApi3CdkEnver, OdmdEnverCtnImg>
    readonly appImgLatestRef: OdmdCrossRefConsumer<SampleSpringOpenApi3CdkEnver, OdmdEnverCtnImg>
    readonly apiEndpoint: OdmdCrossRefProducer<SampleSpringOpenApi3CdkEnver>;

}

export class SampleSpringOpenApi3Cdk extends OdmdBuild<OdmdEnverCdk> {

    private _envers: Array<SampleSpringOpenApi3CdkEnver>
    get envers(): Array<SampleSpringOpenApi3CdkEnver> {
        return this._envers
    }

    private _theMaster: SampleSpringOpenApi3CdkEnver
    get theMaster(): SampleSpringOpenApi3CdkEnver {
        return this._theMaster
    }


    workDirs = ['cdk']

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'sampleSpringOpenAPI3cdk', scope.githubRepos.sampleApiEcs);
    }

    protected initializeEnvers(): void {
        this._theMaster = new SampleSpringOpenApi3CdkEnver(this,
            this.contracts.accounts.workspace1, 'us-west-1',
            new SRC_Rev_REF('b', 'master')
        )

        this._envers = [this.theMaster]
    }


    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }

}