import {
    OdmdBuild,
    OdmdEnverCtnImg,
    CtnImgRefProducer,
    SRC_Rev_REF,
} from "@ondemandenv/contracts-lib-base";
import {RepositoryProps} from "aws-cdk-lib/aws-ecr";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {IGrantable} from "aws-cdk-lib/aws-iam";
import {OdmdCrossRefProducer} from "@ondemandenv/contracts-lib-base/lib/model/odmd-cross-refs";
import {AnyOdmdEnVer} from "@ondemandenv/contracts-lib-base/lib/model/odmd-enver";

export class SampleSpringOpenApi3ImgEnver extends OdmdEnverCtnImg {
    builtImgNameToRepoGrants: {
        [imgName: string]: [grantee: IGrantable | OdmdCrossRefProducer<AnyOdmdEnVer>, ...actions: string[]][];
    };

    constructor(owner: SampleSpringOpenApi3Img, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.builtImgNameToRepo = {[this.imgName]: {repositoryName: this.genRepoName('open3')}}
        this.ctnImgRefProducer = new CtnImgRefProducer(this, 'imgProducer', {repoPathPart: 'imgRepo'});
        this.builtImgNameToRepoProducer = {
            [this.imgName]: this.ctnImgRefProducer
        }
        this.builtImgNameToRepoGrants = {
            [this.imgName]: [
                [owner.contracts.eksCluster!.envers[0].defaultNodeGroupRoleArn,
                    "ecr:BatchGetImage",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:GetRepositoryPolicy"
                ]
            ]
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
    protected initializeEnvers(): void {
        this._theOne = new SampleSpringOpenApi3ImgEnver(this, this.contracts.accounts.workspace1,
            'us-west-1', new SRC_Rev_REF('b', 'master')
        )
        this._envers = [this.theOne]
    }

    private _envers: Array<OdmdEnverCtnImg>
    get envers(): Array<OdmdEnverCtnImg> {
        return this._envers
    }

    private _theOne: SampleSpringOpenApi3ImgEnver
    get theOne(): SampleSpringOpenApi3ImgEnver {
        return this._theOne
    }

    ownerEmail?: string | undefined;

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'sampleSpringOpenAPI3img', scope.githubRepos.sampleApiEcs);

    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }

}