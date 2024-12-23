import {
    OdmdBuild,
    OdmdCrossRefConsumer, OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {CognitoUserPoolEnver} from "../user-pool/CognitoUserPoolCdkOdmdBuild";

export class LlmChatLambdaS3Enver extends OdmdEnverCdk {

    readonly callbackUrl: OdmdCrossRefProducer<LlmChatLambdaS3Enver>
    readonly logoutUrl: OdmdCrossRefProducer<LlmChatLambdaS3Enver>

    readonly userPoolId: OdmdCrossRefConsumer<LlmChatLambdaS3Enver, CognitoUserPoolEnver>
    readonly userPoolArn: OdmdCrossRefConsumer<LlmChatLambdaS3Enver, CognitoUserPoolEnver>
    readonly oauthUserPoolClientId: OdmdCrossRefConsumer<LlmChatLambdaS3Enver, CognitoUserPoolEnver>
    readonly resourceUserPoolClientId: OdmdCrossRefConsumer<LlmChatLambdaS3Enver, CognitoUserPoolEnver>

    constructor(owner: LlmChatLambdaS3OdmdBuild, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        this.callbackUrl = new OdmdCrossRefProducer(this, "callback-url")
        this.logoutUrl = new OdmdCrossRefProducer(this, "logout-url")

        const usrPoolEnver = owner.contracts.userPoolCdk.envers[0];

        this.userPoolId = new OdmdCrossRefConsumer(this, 'userPoolId', usrPoolEnver.userPoolId)
        this.userPoolArn = new OdmdCrossRefConsumer(this, 'userPoolArn', usrPoolEnver.userPoolArn)
        this.oauthUserPoolClientId = new OdmdCrossRefConsumer(this, 'oauthUserPoolClientId', usrPoolEnver.oauthUserPoolClientId)
        this.resourceUserPoolClientId = new OdmdCrossRefConsumer(this, 'resourceUserPoolClientId', usrPoolEnver.resourceUserPoolClientId)
    }

}


export class LlmChatLambdaS3OdmdBuild extends OdmdBuild<OdmdEnverCdk> {

    readonly envers: Array<LlmChatLambdaS3Enver>

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'LlmChatLambdaS3', scope.githubRepos.LlmChatLambdaS3);
        this.envers = [
            new LlmChatLambdaS3Enver(this, scope.accounts.workspace1, 'us-east-1', new SRC_Rev_REF('b', 'main')),
        ]
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox
    }

}