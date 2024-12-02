import {
    OdmdBuild,
    OdmdEnverCtnImg,
    CtnImgRefProducer,
    SRC_Rev_REF,
} from "@ondemandenv/contracts-lib-base";
import {RepositoryProps} from "aws-cdk-lib/aws-ecr";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {IGrantable} from "aws-cdk-lib/aws-iam";

export class SampleSpringOpenApi3ImgEnver extends OdmdEnverCtnImg {
    builtImgNameToRepoGrants: { [imgName: string]: [grantee: IGrantable, ...actions: string[]][]; };

    constructor(owner: OdmdBuild<OdmdEnverCtnImg>, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
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

    builtImgNameToRepo: { [imgName: string]: RepositoryProps };
    builtImgNameToRepoProducer: { [imgName: string]: CtnImgRefProducer };

}


export class SampleSpringOpenApi3Img extends OdmdBuild<OdmdEnverCtnImg> {

    readonly envers: Array<OdmdEnverCtnImg>
    readonly theOne: SampleSpringOpenApi3ImgEnver

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'sampleSpringOpenAPI3img', scope.githubRepos.sampleApiEcs);
        this.theOne = new SampleSpringOpenApi3ImgEnver(this, scope.accounts.workspace1,
            'us-west-1', new SRC_Rev_REF('b', 'master')
        )
        this.envers = [this.theOne]

    }

}