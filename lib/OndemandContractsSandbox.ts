import {SampleSpringOpenApi3Cdk} from "./repos/sample-spring-openapi3/sample-spring-open-api3-cdk";
import {SampleSpringOpenApi3Img} from "./repos/sample-spring-openapi3/sample-spring-open-api3-img";
import {CoffeeShopFoundationCdk} from "./repos/coffee-shop/coffee-shop-foundation-cdk";
import {CoffeeShopOrderProcessorCdk} from "./repos/coffee-shop/coffee-shop-order-processor-cdk";
import {CoffeeShopOrderManagerCdk} from "./repos/coffee-shop/coffee-shop-order-manager-cdk";
import {App} from "aws-cdk-lib";
import {
    AccountsCentralView,
    GithubReposCentralView,
    GithubRepo,
    OndemandContracts, OdmdBuildNetworking
} from "@ondemandenv.dev/contracts-lib-base";
import {OdmdBuildContractsSbx} from "./repos/_contracts/odmd-build-contracts-sbx";
import {OdmdBuildEksSbx} from "./repos/_eks/odmd-build-eks-sbx";
import {OdmdBuildNtSbx} from "./repos/_nt/odmd-build-nt-sbx";
import {OdmdBuildUserAuthSbx} from "./repos/_user-auth/OdmdBuildUserAuthSbx";
import {OdmdBuildCloudflareInfra} from "./repos/cloudflareinfra/cloudflare-infra";


export type GithubReposSbx = GithubReposCentralView & {
    sampleVpcRds: GithubRepo
    sampleApiEcs: GithubRepo
    CoffeeShopFoundationCdk: GithubRepo
    CoffeeShopOrderProcessorCdk: GithubRepo
    CoffeeShopOrderManagerCdk: GithubRepo
    cloudflare: GithubRepo
}

export type AccountsSbx = AccountsCentralView & {
    workspace1: string,
}


export class OndemandContractsSandbox extends OndemandContracts<AccountsSbx, GithubReposSbx, OdmdBuildContractsSbx> {
    createContractsLibBuild(): OdmdBuildContractsSbx {
        return new OdmdBuildContractsSbx(this);
    }

    constructor(app: App) {
        super(app, 'OndemandContractsSandbox');
    }

    protected initializeBuilds(): void {
        super.initializeBuilds();
        this.springOpen3Img = new SampleSpringOpenApi3Img(this)
        this.springOpen3Cdk = new SampleSpringOpenApi3Cdk(this)
        this.coffeeShopFoundationCdk = new CoffeeShopFoundationCdk(this)
        this.coffeeShopOrderProcessorCdk = new CoffeeShopOrderProcessorCdk(this)
        this.coffeeShopOrderManagerCdk = new CoffeeShopOrderManagerCdk(this)
        this.cloudflareInfraPulumi = new OdmdBuildCloudflareInfra(this)
    }

    protected initializeEksCluster(): void {
        this._eksCluster = new OdmdBuildEksSbx(this);
    }

    protected initializeNetworking(): void {
        this._networking = new OdmdBuildNtSbx(this);
    }


    protected initializeUserAuth() {
        this._userAuth = new OdmdBuildUserAuthSbx(this)
    }

    get allAccounts(): string[] {
        return Object.values(this.accounts);
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


    get networking(): OdmdBuildNtSbx {
        return this._networking! as OdmdBuildNtSbx
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
                },
                cloudflare: {
                    owner: 'ondemandenv',
                    name: 'cloudflare',
                    ghAppInstallID: 41561130
                }
            }
        }
        return this._githubRepos
    }


    public springOpen3Img: SampleSpringOpenApi3Img
    public springOpen3Cdk: SampleSpringOpenApi3Cdk
    public coffeeShopFoundationCdk: CoffeeShopFoundationCdk
    public coffeeShopOrderProcessorCdk: CoffeeShopOrderProcessorCdk
    public coffeeShopOrderManagerCdk: CoffeeShopOrderManagerCdk
    public cloudflareInfraPulumi: OdmdBuildCloudflareInfra


}
