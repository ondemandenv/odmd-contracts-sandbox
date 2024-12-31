import {
    OdmdBuild,
    OdmdCrossRefConsumer, OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";
import {CognitoUserPoolEnver} from "../user-pool/CognitoUserPoolCdkOdmdBuild";

export class VisLlmOdmdDataEnver extends OdmdEnverCdk {

    readonly callbackUrl: OdmdCrossRefProducer<VisLlmOdmdDataEnver>
    readonly logoutUrl: OdmdCrossRefProducer<VisLlmOdmdDataEnver>

    readonly userPoolId: OdmdCrossRefConsumer<VisLlmOdmdDataEnver, CognitoUserPoolEnver>
    readonly userPoolArn: OdmdCrossRefConsumer<VisLlmOdmdDataEnver, CognitoUserPoolEnver>
    readonly oauthUserPoolClientId: OdmdCrossRefConsumer<VisLlmOdmdDataEnver, CognitoUserPoolEnver>
    readonly resourceUserPoolClientId: OdmdCrossRefConsumer<VisLlmOdmdDataEnver, CognitoUserPoolEnver>

    constructor(owner: VisLlmOdmdDataBuild, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
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


export class VisLlmOdmdDataBuild extends OdmdBuild<OdmdEnverCdk> {

    readonly envers: Array<VisLlmOdmdDataEnver>

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'VisLlmOdmdData', scope.githubRepos.VisLlmOdmdData);
        this.envers = [
            new VisLlmOdmdDataEnver(this, scope.accounts.workspace1, 'us-east-1', new SRC_Rev_REF('b', 'master')),
        ]
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox
    }

}