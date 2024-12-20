import {
    OdmdBuild,
    OdmdCrossRefProducer,
    OdmdEnverCdk,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class CognitoUserPoolEnver extends OdmdEnverCdk {

    readonly userPoolId: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly userPoolArn: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly oauthUserPoolClientId: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly resourceUserPoolClientId: OdmdCrossRefProducer<CognitoUserPoolEnver>
    readonly oauth2RedirectUri: OdmdCrossRefProducer<CognitoUserPoolEnver>

    constructor(owner: OdmdBuild<OdmdEnverCdk>, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.userPoolId = new OdmdCrossRefProducer(this, 'userpool-id')
        this.userPoolArn = new OdmdCrossRefProducer(this, 'userpool-arn')
        this.oauth2RedirectUri = new OdmdCrossRefProducer(this, 'oauth2-redirect-uri')
        this.oauthUserPoolClientId = new OdmdCrossRefProducer(this, 'oauth-userpool-clientId')
        this.resourceUserPoolClientId = new OdmdCrossRefProducer(this, 'resource-userpool-clientId')
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