import {
    OdmdBuild,
    OdmdCrossRefConsumer, OdmdCrossRefProducer,
    OdmdEnverCdk, OdmdEnverCtnImg,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class SampleSpringOpenApi3CdkEnver extends OdmdEnverCdk {
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
    }

    readonly appImgRepoRef: OdmdCrossRefConsumer<SampleSpringOpenApi3CdkEnver, OdmdEnverCtnImg>
    readonly appImgLatestRef: OdmdCrossRefConsumer<SampleSpringOpenApi3CdkEnver, OdmdEnverCtnImg>
    readonly apiEndpoint: OdmdCrossRefProducer<SampleSpringOpenApi3CdkEnver>;

}

export class SampleSpringOpenApi3Cdk extends OdmdBuild<OdmdEnverCdk> {

    readonly envers: Array<SampleSpringOpenApi3CdkEnver>

    readonly theMaster: SampleSpringOpenApi3CdkEnver


    workDirs = ['cdk']

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'sampleSpringOpenAPI3cdk', scope.githubRepos.sampleApiEcs);
        this.theMaster = new SampleSpringOpenApi3CdkEnver(this,
            scope.accounts.workspace1, 'us-west-1',
            new SRC_Rev_REF('b', 'master')
        )

        this.envers = [this.theMaster]
    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }

}