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

export class GuardSchedulingEnver extends OdmdEnverCdk {

    readonly apiUrl: OdmdCrossRefProducer<GuardSchedulingEnver>

    readonly idProviderName: OdmdCrossRefConsumer<GuardSchedulingEnver, OdmdEnverUserAuth>
    readonly idProviderClientId: OdmdCrossRefConsumer<GuardSchedulingEnver, OdmdEnverUserAuth>

    constructor(owner: GuardSchedulingBuild, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);

        this.apiUrl = new OdmdCrossRefProducer(this, "api-url")

        const userAuth = owner.contracts.userAuth!.envers[0];

        this.idProviderName = new OdmdCrossRefConsumer(this, 'userPoolId', userAuth.idProviderName)
        this.idProviderClientId = new OdmdCrossRefConsumer(this, 'userPoolArn', userAuth.idProviderClientId)
    }

}


export class GuardSchedulingBuild extends OdmdBuild<OdmdEnverCdk> {
    private _envers: Array<GuardSchedulingEnver>;
    get envers(): Array<GuardSchedulingEnver> {
        return this._envers;
    }

    ownerEmail?: string | undefined;
    readonly extraIamStatements: PolicyStatement[];

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'GuardScheduling', scope.githubRepos.GuardScheduling);
    }

    workDirs: string[] = ['solution', 'cdk'];

    protected initializeEnvers(): void {
        this._envers = [
            new GuardSchedulingEnver(this, this.contracts.accounts.workspace1, 'us-east-1',
                new SRC_Rev_REF('b', 'master'))
        ];
    }

    get contracts() {
        return this.node.scope as OndemandContractsSandbox;
    }
}