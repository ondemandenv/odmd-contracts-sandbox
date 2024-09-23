import {
    ContractsBuild,
    ContractsCrossRefConsumer, ContractsCrossRefProducer,
    ContractsEnverCdk, ContractsEnverCtnImg,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class SampleSpringOpenApi3CdkEnver extends ContractsEnverCdk {
    constructor(owner: SampleSpringOpenApi3Cdk, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.appImgRepoRef = new ContractsCrossRefConsumer(this, 'appImgRefProducer',
            owner.contracts.springOpen3Img.theOne.ctnImgRefProducer)

        this.appImgLatestRef = new ContractsCrossRefConsumer(this, 'appLatestRefProducer',
            owner.contracts.springOpen3Img.theOne.ctnImgRefProducer.latestSha)
        this.apiEndpoint = new ContractsCrossRefProducer<SampleSpringOpenApi3CdkEnver>(this, 'endpoint', {
            children: [
                {pathPart: 'api-doc'},
                {pathPart: 'swagger-ui'}
            ]
        })
    }

    readonly appImgRepoRef: ContractsCrossRefConsumer<SampleSpringOpenApi3CdkEnver, ContractsEnverCtnImg>
    readonly appImgLatestRef: ContractsCrossRefConsumer<SampleSpringOpenApi3CdkEnver, ContractsEnverCtnImg>
    readonly apiEndpoint: ContractsCrossRefProducer<SampleSpringOpenApi3CdkEnver>;

}

export class SampleSpringOpenApi3Cdk extends ContractsBuild<ContractsEnverCdk> {

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