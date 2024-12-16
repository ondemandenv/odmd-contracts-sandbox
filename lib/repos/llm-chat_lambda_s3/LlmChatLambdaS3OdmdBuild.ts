import {
    OdmdBuild,
    OdmdCrossRefConsumer,
    OdmdEnverCdk,
    OdmdEnverContractsLib,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class LlmChatLambdaS3Enver extends OdmdEnverCdk {

    readonly myContractsLibLatest: OdmdCrossRefConsumer<this, OdmdEnverContractsLib>;

    constructor(owner: OdmdBuild<OdmdEnverCdk>, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        this.myContractsLibLatest = new OdmdCrossRefConsumer(this, 'contractsLibLatest',
            owner.contracts.contractsLibBuild.envers.find(e => e.targetAWSRegion == this.targetAWSRegion)!.contractsLibLatest)
    }

}


export class LlmChatLambdaS3OdmdBuild extends OdmdBuild<OdmdEnverCdk> {

    readonly envers: Array<LlmChatLambdaS3Enver>

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'LlmChatLambdaS3', scope.githubRepos.LlmChatLambdaS3);
        this.envers = [
            new LlmChatLambdaS3Enver(this, scope.accounts.workspace1, 'us-west-1', new SRC_Rev_REF('b', 'main')),
        ]

    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox
    }

}