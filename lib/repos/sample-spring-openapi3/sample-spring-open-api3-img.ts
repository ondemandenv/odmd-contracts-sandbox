import {ContractsBuild, ContractsEnverCtnImg, CtnImgRefProducer, SRC_Rev_REF} from "@ondemandenv/contracts-lib-base";
import {RepositoryProps} from "aws-cdk-lib/aws-ecr";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {Construct} from "constructs";

export class SampleSpringOpenApi3ImgEnver extends ContractsEnverCtnImg {
    constructor(owner: ContractsBuild<ContractsEnverCtnImg>, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.builtImgNameToRepo = {[this.imgName]: {repositoryName: this.genRepoName('open3')}}
        this.ctnImgRefProducer = new CtnImgRefProducer(this, 'imgProducer', {repoPathPart: 'imgRepo'});
        this.builtImgNameToRepoProducer = {
            [this.imgName]: this.ctnImgRefProducer
        }
    }

    get imgName() {
        return 'spring-boot-swagger-3-example:0.0.1-SNAPSHOT'
        // return 'img' + this.targetRevision.toPathPartStr()
    }

    ctnImgRefProducer: CtnImgRefProducer

    buildCmds = ['JAVA_HOME=$JAVA_HOME_17_X64 && chmod +x mvnw && ./mvnw org.springframework.boot:spring-boot-maven-plugin:3.0.4:build-image']
    builtImgNameToRepo: { [imgName: string]: RepositoryProps };
    builtImgNameToRepoProducer: { [imgName: string]: CtnImgRefProducer };

}


export class SampleSpringOpenApi3Img extends ContractsBuild<ContractsEnverCtnImg> {

    readonly envers: Array<ContractsEnverCtnImg>
    readonly theOne: SampleSpringOpenApi3ImgEnver

    gitHubRepo = OndemandContractsSandbox.myInst.githubRepos.sampleApiEcs
    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'sampleSpringOpenAPI3img');
        this.theOne = new SampleSpringOpenApi3ImgEnver(this, OndemandContractsSandbox.myInst.accounts.workspace1,
            'us-west-1', new SRC_Rev_REF('b', 'master')
        )
        this.envers = [this.theOne]

    }

}