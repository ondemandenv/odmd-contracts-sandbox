import {
    OdmdBuildContractsLib,
    OdmdEnverContractsLib,
    SRC_Rev_REF
} from "@ondemandenv/contracts-lib-base";

import {AccountsSbx, GithubReposSbx, OndemandContractsSandbox} from "../../OndemandContractsSandbox";

export class OdmdBuildContractsSbx extends OdmdBuildContractsLib<AccountsSbx, GithubReposSbx> {
    private _envers: OdmdEnverContractsLib[];
    get envers(): OdmdEnverContractsLib[] {
        return this._envers;
    }

    get theOne(): OdmdEnverContractsLib {
        return this._envers[0];
    }

    ownerEmail?: string | undefined;

    public get packageName(): string {
        return '@ondemandenv/odmd-contracts-sandbox';
    }

    constructor(scope: OndemandContractsSandbox) {
        super(scope, 'odmd-contracts-npm');
    }

    protected initializeEnvers(): void {
        this._envers = [
            new OdmdEnverContractsLib(
                this,
                this.contracts.accounts.workspace0,
                'us-west-1',
                new SRC_Rev_REF("b", "main")
            ),
            new OdmdEnverContractsLib(
                this,
                this.contracts.accounts.workspace0,
                'us-east-1',
                new SRC_Rev_REF("b", "__placeholder")
            )
        ];
    }

    get contracts(): OndemandContractsSandbox {
        return super.contracts as OndemandContractsSandbox;
    }
}