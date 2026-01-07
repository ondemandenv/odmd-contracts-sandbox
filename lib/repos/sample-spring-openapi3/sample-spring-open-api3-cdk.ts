import {
    KubeCtlThruCentral,
    OdmdBuild,
    OdmdCrossRefConsumer, OdmdCrossRefProducer,
    OdmdEnverCdk, OdmdEnverCtnImg,
    OdmdEnverEksCluster,
    SRC_Rev_REF
} from "@ondemandenv.dev/contracts-lib-base";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {OdmdBuildEksSbx, EksClusterEnverSbx} from "../_eks/odmd-build-eks-sbx";
import * as path from "path"

export class SampleSpringOpenApi3CdkEnver extends OdmdEnverCdk implements KubeCtlThruCentral {
    readonly enverContextMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md')
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
        const eksClusterEnverSbx = (owner.contracts.eksCluster! as OdmdBuildEksSbx).envers[0];
        this.targetEksClusterEndpoint = new OdmdCrossRefConsumer(this, 'targetEksClusterEndpoint', eksClusterEnverSbx.clusterEndpoint,
            {trigger: 'directly', defaultIfAbsent: 'https://abc123.us-east-1.eks.amazonaws.com' })
        this.oidcProvider = new OdmdCrossRefConsumer(this, 'oidcProviderArn', eksClusterEnverSbx.oidcProvider,
            {trigger: 'directly', defaultIfAbsent: 'https://oidc.eks.us-west-2.amazonaws.com/id/EXAMPLED1234abcd'})
        this.defaultNodeGroupRoleArn = new OdmdCrossRefConsumer(this, 'defaultNodeGroupRoleArn', eksClusterEnverSbx.defaultNodeGroupRoleArn,
            { trigger: "directly", defaultIfAbsent: 'arn:aws:iam::123456789012:role/eksctl-my-cluster-nodegroup-role-NodeInstanceRole-aifle'})
    }

    targetEksClusterEndpoint: OdmdCrossRefConsumer<KubeCtlThruCentral, OdmdEnverEksCluster>;
    oidcProvider: OdmdCrossRefConsumer<KubeCtlThruCentral, OdmdEnverEksCluster>;
    defaultNodeGroupRoleArn: OdmdCrossRefConsumer<KubeCtlThruCentral, OdmdEnverEksCluster>;


    readonly appImgRepoRef: OdmdCrossRefConsumer<SampleSpringOpenApi3CdkEnver, OdmdEnverCtnImg>
    readonly appImgLatestRef: OdmdCrossRefConsumer<SampleSpringOpenApi3CdkEnver, OdmdEnverCtnImg>
    readonly apiEndpoint: OdmdCrossRefProducer<SampleSpringOpenApi3CdkEnver>;

}

export class SampleSpringOpenApi3Cdk extends OdmdBuild<OdmdEnverCdk> {
    readonly serviceContextMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md')
    readonly serviceOverviewMD = path.resolve(__dirname, 'docs', 'SERVICE_OVERVIEW.md')

    protected _envers: Array<SampleSpringOpenApi3CdkEnver>
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