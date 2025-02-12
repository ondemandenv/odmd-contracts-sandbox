import {
    OdmdBuild,
    OdmdCrossRefConsumer,
    OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {OdmdEnverUserAuth} from "@ondemandenv/contracts-lib-base/lib/repos/__user-auth/odmd-build-user-auth";

export class LlmChatLambdaS3Enver extends OdmdEnverCdk {

    readonly callbackUrl: OdmdCrossRefProducer<LlmChatLambdaS3Enver>
    readonly logoutUrl: OdmdCrossRefProducer<LlmChatLambdaS3Enver>

    readonly idProviderName: OdmdCrossRefConsumer<LlmChatLambdaS3Enver, OdmdEnverUserAuth>
    readonly idProviderClientId: OdmdCrossRefConsumer<LlmChatLambdaS3Enver, OdmdEnverUserAuth>

    constructor(owner: LlmChatLambdaS3OdmdBuild, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        this.callbackUrl = new OdmdCrossRefProducer(this, "callback-url")
        this.logoutUrl = new OdmdCrossRefProducer(this, "logout-url")

        const usrPoolEnver = owner.contracts.userAuth!.envers[0];

        this.idProviderName = new OdmdCrossRefConsumer(this, 'idProviderName', usrPoolEnver.idProviderName)
        this.idProviderClientId = new OdmdCrossRefConsumer(this, 'idProviderClientId', usrPoolEnver.idProviderClientId)
        // this.oauthUserPoolClientId = new OdmdCrossRefConsumer(this, 'oauthUserPoolClientId', usrPoolEnver.oauthUserPoolClientId)
        // this.resourceUserPoolClientId = new OdmdCrossRefConsumer(this, 'resourceUserPoolClientId', usrPoolEnver.resourceUserPoolClientId)
    }

}


export class LlmChatLambdaS3OdmdBuild extends OdmdBuild<OdmdEnverCdk> {
    private _envers: Array<LlmChatLambdaS3Enver>;
    get envers(): Array<LlmChatLambdaS3Enver> {
        return this._envers;
    }

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'LlmChatLambdaS3', scope.githubRepos.LlmChatLambdaS3);
    }

    protected initializeEnvers(): void {
        this._envers = [
            new LlmChatLambdaS3Enver(this, this.contracts.accounts.workspace1, 'us-east-1',
                new SRC_Rev_REF('b', 'main')),
            new LlmChatLambdaS3Enver(this, this.contracts.accounts.workspace1, 'us-east-1',
                new SRC_Rev_REF('b', 'llm_chat_appsync')),
        ];
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox;
    }
}