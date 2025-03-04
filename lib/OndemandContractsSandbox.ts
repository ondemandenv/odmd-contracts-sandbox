import {SampleSpringOpenApi3Cdk} from "./repos/sample-spring-openapi3/sample-spring-open-api3-cdk";
import {SampleSpringOpenApi3Img} from "./repos/sample-spring-openapi3/sample-spring-open-api3-img";
import {CoffeeShopFoundationCdk} from "./repos/coffee-shop/coffee-shop-foundation-cdk";
import {CoffeeShopOrderProcessorCdk} from "./repos/coffee-shop/coffee-shop-order-processor-cdk";
import {CoffeeShopOrderManagerCdk} from "./repos/coffee-shop/coffee-shop-order-manager-cdk";
import {App} from "aws-cdk-lib";
import {
    AccountsCentralView,
    GithubReposCentralView,
} from "@ondemandenv/contracts-lib-base/lib/OdmdContractsCentralView";
import {
    GithubRepo, OdmdBuild, OdmdEnverCdk,
    OndemandContracts
} from "@ondemandenv/contracts-lib-base";
import {OdmdBuildContractsSbx} from "./repos/_contracts/odmd-build-contracts-sbx";
import {OdmdBuildUserAuthSbx} from "./repos/_user-auth/OdmdBuildUserAuthSbx";
import {OdmdBuildEksSbx} from "./repos/_eks/odmd-build-eks-sbx";


export type GithubReposSbx = GithubReposCentralView & {
    sampleVpcRds: GithubRepo
    sampleApiEcs: GithubRepo
    CoffeeShopFoundationCdk: GithubRepo
    CoffeeShopOrderProcessorCdk: GithubRepo
    CoffeeShopOrderManagerCdk: GithubRepo
}

export type AccountsSbx = AccountsCentralView & {
    workspace1: string,
}


export class OndemandContractsSandbox extends OndemandContracts<AccountsSbx, GithubReposSbx, OdmdBuildContractsSbx> {

    createContractsLibBuild(): OdmdBuildContractsSbx {
        return new OdmdBuildContractsSbx(this)
    }

    protected initializeUserAuth() {
        this._userAuth = new OdmdBuildUserAuthSbx(this)
    }


    protected initializeEksCluster() {
        this._eksCluster = new OdmdBuildEksSbx(this);
    }

    private static _inst: OndemandContractsSandbox
    public static get inst(): OndemandContractsSandbox {
        return this._inst
    }


    get userAuth(): OdmdBuildUserAuthSbx {
        return super.userAuth! as OdmdBuildUserAuthSbx;
    }

    get eksCluster(): OdmdBuildEksSbx | undefined {
        return super.eksCluster as OdmdBuildEksSbx;
    }

    constructor(app: App) {
        super(app, 'OndemandContractsSandbox');
        if (OndemandContractsSandbox._inst) {
            throw new Error('not allowed')
        }
        OndemandContractsSandbox._inst = this;

        this.springOpen3Img = new SampleSpringOpenApi3Img(this)
        this.springOpen3Cdk = new SampleSpringOpenApi3Cdk(this)
        this.coffeeShopFoundationCdk = new CoffeeShopFoundationCdk(this)
        this.coffeeShopOrderProcessorCdk = new CoffeeShopOrderProcessorCdk(this)
        this.coffeeShopOrderManagerCdk = new CoffeeShopOrderManagerCdk(this)

        this.userAuth.wireConsuming()

        let tmpSet = new Set(this.odmdBuilds);
        if (tmpSet.size != this.odmdBuilds.length) {
            tmpSet.forEach(b => {
                const i = this.odmdBuilds.indexOf(b)
                this.odmdBuilds.splice(i, 1)
            })

            throw new Error('duplicated envers?!')
        }

        if (!process.env.CDK_CLI_VERSION) {
            throw new Error("have to have process.env.CDK_CLI_VERSION!")
        }

        const buildRegion = process.env.CDK_DEFAULT_REGION;
        let buildAccount: string;
        if (process.env.CDK_DEFAULT_ACCOUNT) {
            buildAccount = process.env.CDK_DEFAULT_ACCOUNT;
        } else {
            console.log(`process.env.CDK_DEFAULT_ACCOUNT undefined, trying to find account in CodeBuild with CODEBUILD_BUILD_ARN: ${process.env.CODEBUILD_BUILD_ARN}`)
            if (!process.env.CODEBUILD_BUILD_ARN) {
                throw new Error(`process.env.CODEBUILD_BUILD_ARN undefined, unable to initialize without account information.`)
            }
            buildAccount = process.env.CODEBUILD_BUILD_ARN!.split(":")[4];
        }
        if (!buildRegion || !buildAccount) {
            throw new Error("buildRegion>" + buildRegion + "; buildAccount>" + buildAccount)
        }
    }


    private _accounts: AccountsSbx
    get accounts(): AccountsSbx {
        if (!this._accounts) {
            this._accounts = {
                central: '590184031795',
                networking: '590183907424',
                workspace0: "975050243618",
                workspace1: '590184130740',
            }
        }
        return this._accounts
    }

    private _allAccounts: string[]
    get allAccounts(): string[] {
        if (!this._allAccounts) {
            const accEntries = Object.entries(this.accounts);
            if (Array.from(accEntries.keys()).length != Array.from(accEntries.values()).length) {
                throw new Error("Account name to number has to be 1:1!")
            }

            this._allAccounts = Object.values(this.accounts)

        }
        return this._allAccounts
    }

    private _githubRepos: GithubReposSbx
    get githubRepos(): GithubReposSbx {
        if (!this._githubRepos) {
            this._githubRepos = {
                githubAppId: "377358",
                __contracts: {
                    owner: 'ondemandenv',
                    name: 'odmd-contracts-sandbox',
                    ghAppInstallID: 41561130
                },
                __userAuth: {
                    owner: 'ondemandenv',
                    name: 'user-pool',
                    ghAppInstallID: 41561130
                },
                __eks: {
                    owner: 'ondemandenv',
                    name: 'odmd-eks',
                    ghAppInstallID: 41561130
                },
                __networking: {
                    owner: 'ondemandenv',
                    name: 'networking',
                    ghAppInstallID: 41561130
                },
                _defaultKubeEks: {
                    owner: 'ondemandenv',
                    name: 'default-ecr-eks',
                    ghAppInstallID: 41561130
                },
                _defaultVpcRds: {
                    owner: 'ondemandenv',
                    name: 'default-vpc-rds',
                    ghAppInstallID: 41561130
                },
                sampleVpcRds: {
                    owner: 'ondemandenv',
                    name: 'springcdk-rds',
                    ghAppInstallID: 41561130
                },

                sampleApiEcs: {
                    owner: 'ondemandenv',
                    name: 'spring-boot-swagger-3-example',
                    ghAppInstallID: 41561130
                },
                CoffeeShopFoundationCdk: {
                    owner: 'ondemandenv',
                    name: 'coffee-shop--foundation',
                    ghAppInstallID: 41561130
                },
                CoffeeShopOrderManagerCdk: {
                    owner: 'ondemandenv',
                    name: 'coffee-shop--order-manager',
                    ghAppInstallID: 41561130
                },
                CoffeeShopOrderProcessorCdk: {
                    owner: 'ondemandenv',
                    name: 'coffee-shop--order-processor',
                    ghAppInstallID: 41561130
                }
            }
        }
        return this._githubRepos
    }


    public readonly springOpen3Img
    public readonly springOpen3Cdk
    public readonly coffeeShopFoundationCdk
    public readonly coffeeShopOrderProcessorCdk
    public readonly coffeeShopOrderManagerCdk: CoffeeShopOrderManagerCdk


}
