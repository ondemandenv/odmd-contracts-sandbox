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

export class VisLlmOdmdDataEnver extends OdmdEnverCdk {

    readonly callbackUrl: OdmdCrossRefProducer<VisLlmOdmdDataEnver>
    readonly logoutUrl: OdmdCrossRefProducer<VisLlmOdmdDataEnver>

    readonly idProviderName: OdmdCrossRefConsumer<VisLlmOdmdDataEnver, OdmdEnverUserAuth>
    readonly idProviderClientId: OdmdCrossRefConsumer<VisLlmOdmdDataEnver, OdmdEnverUserAuth>

    constructor(owner: VisLlmOdmdDataBuild, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        this.callbackUrl = new OdmdCrossRefProducer(this, "callback-url")
        this.logoutUrl = new OdmdCrossRefProducer(this, "logout-url")

        const userAuth = owner.contracts.userAuth!.envers[0];

        this.idProviderName = new OdmdCrossRefConsumer(this, 'userPoolId', userAuth.idProviderName)
        this.idProviderClientId = new OdmdCrossRefConsumer(this, 'userPoolArn', userAuth.idProviderClientId)
    }

}


export class VisLlmOdmdDataBuild extends OdmdBuild<OdmdEnverCdk> {
    private _envers: Array<VisLlmOdmdDataEnver>;
    get envers(): Array<VisLlmOdmdDataEnver> {
        return this._envers;
    }

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'VisLlmOdmdData', scope.githubRepos.VisLlmOdmdData);
    }

    protected initializeEnvers(): void {
        this._envers = [
            new VisLlmOdmdDataEnver(this, this.contracts.accounts.workspace1, 'us-east-1',
                new SRC_Rev_REF('b', 'master')),
        ];
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox;
    }
}