import {
    OdmdBuild, OdmdCrossRefConsumer,
    OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {LlmChatLambdaS3Enver} from "../llm-chat_lambda_s3/LlmChatLambdaS3OdmdBuild";

export class CognitoUserPoolEnver extends OdmdEnverCdk {

    readonly userPoolId: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly userPoolArn: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly oauthUserPoolClientId: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly resourceUserPoolClientId: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly oauth2RedirectUri: OdmdCrossRefProducer<CognitoUserPoolEnver>


    readonly llmChatCallbackUrl: OdmdCrossRefConsumer<CognitoUserPoolEnver, LlmChatLambdaS3Enver>[]
    readonly llmChatLogoutUrl: OdmdCrossRefConsumer<CognitoUserPoolEnver, LlmChatLambdaS3Enver>[]

    constructor(owner: CognitoUserPoolCdkOdmdBuild, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.userPoolId = new OdmdCrossRefProducer(this, 'userpool-id')
        this.userPoolArn = new OdmdCrossRefProducer(this, 'userpool-arn')
        this.oauth2RedirectUri = new OdmdCrossRefProducer(this, 'oauth2-redirect-uri')
        this.oauthUserPoolClientId = new OdmdCrossRefProducer(this, 'oauth-userpool-clientId')
        this.resourceUserPoolClientId = new OdmdCrossRefProducer(this, 'resource-userpool-clientId')

        this.llmChatCallbackUrl = []
        this.llmChatLogoutUrl = []

    }


    consumeLlmChatLambdaS3Enver() {
        (this.owner as CognitoUserPoolCdkOdmdBuild).contracts.llmChatLambdaS3Cdk.envers.forEach(llmChat => {
            this.llmChatCallbackUrl.push(new OdmdCrossRefConsumer(this, llmChat.node.id + '-callback', llmChat.callbackUrl))
            this.llmChatLogoutUrl.push(new OdmdCrossRefConsumer(this, llmChat.node.id + '-logout', llmChat.logoutUrl))
        })
    }


}


export class CognitoUserPoolCdkOdmdBuild extends OdmdBuild<OdmdEnverCdk> {

    readonly envers: Array<CognitoUserPoolEnver>

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'CognitoUserPool', scope.githubRepos.UserPool);
        this.envers = [
            new CognitoUserPoolEnver(this, scope.accounts.workspace0, 'us-east-1', new SRC_Rev_REF('b', 'main')),
        ]
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox
    }

}