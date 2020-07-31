<template>
  <q-page class="gatewayDetail-container">
    <div class="gatewayDetail-content">
      <div class="no-wrap q-pa-md row justify-between">
        <span>
          <i class="material-icons vertical-align-sub font-20 text-black">border_color</i>
          <h5
            class="q-px-md inline-block text-tertiary font-18 q-my-none"
          >{{$t('COUNCIL_PARTICULARS')}}</h5>
        </span>

        <div :class="homeTopRightClass" v-if="isCouncil>-1">
          <div class="home-top-btn-container">
            <i class="material-icons font-24 vertical-align-middle text-eight">call_missed</i>
            <q-btn
              class="text-secondary font-18 font-weight"
              size="xs"
              :label="$t('TRS_TYPE_TRANSFER')"
              flat
              @click="transBtncli"
            />
          </div>
          <span class="btn-container-line" v-if="isCouncil>-1"></span>
          <div class="home-top-btn-container" v-if="isCouncil>-1">
            <i class="material-icons font-24 vertical-align-middle text-eight">call_missed_outgoing</i>
            <q-btn
              class="text-secondary font-18 font-weight"
              size="xs"
              :label="$t('proposal.SELECT_MEMBER_ADD')"
              flat
              @click="addmenber"
            />
          </div>
        </div>
      </div>
      <div class="title-line">
        <boundary-line />
      </div>
      <div class="row q-px-md gutter-md">
        <div class="col-md-6 col-xs-12">
          <q-table
            :title="$t('COUNCIL_PAGE.MODAL_TITLE', {number: datas.length})"
            :data="datas"
            :columns="isCouncil>-1?columnsCouncil:columns"
            :loading="loading"
            row-key="address"
            @request="request"
            :rows-per-page-options="[10]"
            hide-bottom
          >
            <q-td slot="body-cell-address" slot-scope="props" :props="props">
              <div
                class="text-secondary cursor-pointer"
                @click="viewAccountInfo(props.row.address)"
              >{{props.row.address}}</div>
            </q-td>
            <q-td slot="body-cell-iron" slot-scope="cell" style="width:200px;">
              <div class="q-mb-xs">
                <a href="javascript:void(0);" @click="deleMenber(cell.row)">移除</a>
              </div>
            </q-td>
          </q-table>
        </div>

        <div v-if="accountLeft" :class="gatewayDetailClass">
          <q-list class="column padding-0 council-list">
            <q-list-header
              class="font-16 text-five font-weight bg-nine padding-l-15"
              inset
            >{{$t('COUNCILDETAIL_BANLANCE')}}</q-list-header>
            <q-item v-for="(balance, idx) in balances" :key="idx">
              <q-item-side>
                <q-item-tile avatar>
                  <asset-icon :iconKey="balance.label" />
                </q-item-tile>
              </q-item-side>
              <q-item-main>
                <q-item-tile class="text-five font-16" label>{{balance.label}}</q-item-tile>
              </q-item-main>
              <q-item-side right>
                <q-item-tile class="text-five font-16">{{balance.value}}</q-item-tile>
              </q-item-side>
            </q-item>
          </q-list>

          <q-table
            :title="'投票'"
            :data="Voticedatas"
            :columns="isCouncil>-1?VocolumnsCouncil:Vocolumns"
            :loading="Voloading"
            row-key="type"
            @request="Vorequest"
            :rows-per-page-options="[10]"
            hide-bottom
          >
            <q-td slot="body-cell-iron" slot-scope="cell" style="width:200px;">
              <div class="q-mb-xs">
                <a href="javascript:void(0);" @click="VotersCli(cell.row)">投票</a>
              </div>
            </q-td>
          </q-table>
        </div>
      </div>
      <div class="col-12 bg-white q-px-md q-py-md">
        <trans-record-container :userInfo="councilAccount" class="table" />
      </div>
    </div>

    <div class="mengceng" v-if="openshow">
      <div class="childMen">
        <div class="filpTishi">{{transtaus==true?'转账':'新增成员'}}</div>
        <div class="dongtaiCon">
          <div v-if="transtaus">
            <div class="inputlist">
              <span class="listSpan">接受者：</span>
              <input type="text" v-model="trans.recipientId" />
            </div>
            <div class="inputlist">
              <span class="listSpan">类型：</span>
              <input type="text" value="XAS" v-model="trans.type" />
            </div>
            <div class="inputlist">
              <span class="listSpan">金额：</span>
              <input type="number" v-model="trans.amount" />
            </div>
            <div class="inputlist">
              <span class="listSpan">备注：</span>
              <input type="text" v-model="trans.memo" />
            </div>
          </div>
          <div v-else>
            <div class="inputlist">
              <span class="listSpan">地址：</span>
              <input type="text" v-model="council.address" />
            </div>
            <div class="inputlist">
              <span class="listSpan">昵称：</span>
              <input type="text" v-model="council.name" />
            </div>
            <div class="inputlist">
              <span class="listSpan">网址：</span>
              <input type="text" v-model="council.website" />
            </div>
          </div>
        </div>
        <div class="btnCommon" @click="closeModel">关闭</div>
        <div class="btnCommon" @click="sendTrans">发送</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import {
  QPage,
  QTable,
  QCard,
  QCardTitle,
  QCardMain,
  QBtn,
  QTd,
  QList,
  QListHeader,
  QItem,
  QItemMain,
  QItemSide,
  QItemTile,
  QItemSeparator
  // QScrollArea
} from "quasar";
import { mapActions, mapGetters } from "vuex";
import {
  compileTimeStamp,
  getTimeFromHight,
  getCache,
  translateErrMsg,
  toast
} from "../utils/util";
import { convertFee, dealGiantNumber } from "../utils/asch";
import TransRecordContainer from "../components/TransRecordContainer";
import { secondPwd } from "../utils/validators";
import TransPanel from "../components/TransPanel";
import BoundaryLine from "../components/BoundaryLine";
import AssetIcon from "../components/AssetIcon";
import PromptMessage from "../components/PromptMessage";
import buyBackIcon from "../assets/buy_back_icon.png";
import asch from "../utils/asch";
export default {
  name: "councilDetail",
  props: [],
  components: {
    QPage,
    QTable,
    QCard,
    QCardTitle,
    QCardMain,
    QBtn,
    QTd,
    QList,
    QListHeader,
    QItem,
    QItemMain,
    QItemSide,
    QItemTile,
    QItemSeparator,
    TransRecordContainer,
    BoundaryLine,
    AssetIcon,
    PromptMessage
    // QScrollArea,
    // VueMarkdown
  },
  data() {
    return {
      isCouncil: -1,
      buyBackIcon,
      council: {
        address: "",
        name: "",
        website: ""
      },
      trans: {
        recipientId: "",
        type: "XAS",
        amount: 0,
        memo: ""
      },
      isMouseover: false,
      openshow: false,
      transtaus: true,
      currency: "",
      secondPwd: "",

      balance: "",
      precision: 0,
      fee: "",
      btnDisable: false,
      user: getCache("user"),
      columnsCouncil: [
        {
          name: "name",
          required: true,
          label: "昵称", //this.$t("NICKNAME"),
          align: "center",
          field: "name"
        },
        {
          name: "address",
          required: true,
          label: "地址", //this.$t("ADDRESS"),
          align: "center",
          field: "address"
        },
        {
          name: "iron",
          required: true,
          label: "操作",
          align: "center"
        }
      ],
      columns: [
        {
          name: "name",
          required: true,
          label: "昵称",
          align: "center",
          field: "name"
        },
        {
          name: "address",
          required: true,
          label: "地址",
          align: "center",
          field: "address"
        }
      ],
      VocolumnsCouncil: [
        {
          name: "name",
          required: true,
          label: "名称",
          align: "center",
          field: "name"
        },
        {
          name: "type",
          required: true,
          label: "类型",
          align: "center",
          field: "type"
        },
        {
          name: "votes",
          required: true,
          label: "投票数",
          align: "center",
          field: "votes"
        },
        {
          name: "iron",
          required: true,
          label: "操作",
          align: "center"
        }
      ],
      Vocolumns: [
        {
          name: "name",
          required: true,
          label: "名称",
          align: "center",
          field: "name"
        },
        {
          name: "type",
          required: true,
          label: "类型",
          align: "center",
          field: "type"
        },
        {
          name: "votes",
          required: true,
          label: "投票数",
          align: "center",
          field: "votes"
        }
      ],
      loading: false,
      Voloading: false,
      datas: [],
      Voticedatas: [],
      balances: [],
      group: null,
      accountLeft: 0,
      address: "GADQ2bozmxjBfYHDQx3uwtpwXmdhafUdkN",

      userName: ""
    };
  },
  validations: {
    secondPwd: {
      secondPwd: secondPwd()
    }
  },
  created() {
    // this.$root.$on('openTransactionDialog', this.openTransactionDialog)
  },
  beforeDestroy() {
    // this.$root.$off('openTransactionDialog', this.openTransactionDialog)
  },
  mounted() {
    this.loadData();
    this.loadVotes();
    this.getGroupAccount();
    this.isCouncilMember();
    // this.getBurnAccount()
    // this.getBuyBackBalance()
    this.getCouncilAssets();
  },
  methods: {
    ...mapActions([
      "getCouncil",
      "getAccountsInfo",
      "getBalances",
      "getCouncilMember",
      "getCouncilVotes",
      "broadcastTransaction",
      "accountdetail"
    ]),
    async loadData() {
      console.log("user:", this.user);
      let data = await this.getCouncilMember({
        address: this.address
      });
      if (data.success) {
        this.datas = data.data;
      }
    },
    async loadVotes() {
      let votes = await this.getCouncilVotes();
      if (votes.success) {
        this.Voticedatas = votes.data;
        //console.log("votes", this.Voticedatas);
      }
    },
    async getCouncilAssets() {
      let balances = [];
      let accountRes = await this.getAccountsInfo({
        address: this.address
      });

      if (accountRes.success && accountRes.account) {
        balances.push({
          label: "XAS",
          value: convertFee(accountRes.account.xas, 8)
        });
      }

      let balancesRes = await this.getBalances({
        address: this.address
      });
      if (balancesRes.success && balancesRes.balances.length >= 1) {
        balancesRes.balances.forEach(balance => {
          if (balance.balance >= 1) {
            balances.push({
              label: balance.currency,
              value: convertFee(balance.balance, balance.asset.precision)
            });
          }
        });
      }
      this.balances = this.balances.concat(balances);
    },
    async getGroupAccount() {
      let res = await this.getAccountsInfo({
        address: this.address
      });
      if (res.success && res.account) {
        this.accountLeft = res.account.xas;
      }
    },
    async request(props) {
      this.loading = true;
      this.filter = props.filter;
      await this.loadData();
      this.loading = false;
    },

    // 转账
    transBtncli() {
      this.openshow = true;
      this.transtaus = true;
    },
    addmenber() {
      this.openshow = true;
      this.transtaus = false;
    },
    closeModel() {
      this.openshow = false;
    },
    // 查询是否为理事会成员
    async isCouncilMember() {
      //查询当前用户是否是理事会成员
      //理事会成员才可以发起转账
      let members = [];
      let data = await this.getCouncilMember({
        address: this.address
      });
      if (data.success) {
        members = data.data;
      }
      //console.log(members, "members");
      const address = this.user.account.address;
      for (let count = 0; count < members.length; count++) {
        if (address == members[count].address) {
          this.isCouncil = count;
          break;
        }
      }
    },
    //发送按钮
    async sendTrans() {
      if (this.isCouncil > -1) {
        //发送
        let trans = {};
        let res;
        let fee = 10000000;
        if (this.transtaus) {
          const amount = dealGiantNumber(this.trans.amount, 8);
          // 发起转账
          trans = asch.initiatePayment(
            this.trans.recipientId,
            amount,
            this.trans.type,
            this.trans.memo,
            this.user.secret,
            this.secondPwd,
            Number(fee)
          );
        } else {
          // 添加成员
          trans = asch.registerCouncilMember(
            this.council.name,
            this.council.address,
            this.council.website,
            this.user.secret,
            this.secondPwd,
            Number(fee)
          );
        }
        res = await this.broadcastTransaction(trans);

        if (res.success === true) {
          toast(this.$t("INF_TRANSFER_SUCCESS"));
          this.openshow = false;
          return true;
        } else {
          translateErrMsg(this.$t, res.error);
          return false;
        }
      } else {
        toast("没有权限");
      }
    },
    //投票按钮---增加成员投票，转账投票
    async VotersCli(row) {
      if (this.isCouncil > -1) {
        const name = this.user.account.address;
        console.log("投票人：", name);
        let vote = {};
        //console.log(row, "toupiao");
        if (row.type == "转账") {
          vote = asch.voteTrans(
            row.tid,
            this.user.account.address,
            this.user.secret,
            this.secondPwd
          );
        } else if (row.type == "增加成员") {
          vote = asch.voteCouncil(
            row.name,
            name,
            this.user.secret,
            this.secondPwd
          );
        } else {
          vote = asch.deleteCouncilVote(
            row.name,
            name,
            this.user.secret,
            this.secondPwd
          );
        }

        let res = await this.broadcastTransaction(vote);

        if (res.success === true) {
          toast(this.$t("INF_TRANSFER_SUCCESS"));
          return true;
        } else {
          translateErrMsg(this.$t, res.error);
          return false;
        }
      } else {
        toast("没有权限");
      }
    },

    async deleMenber(row) {
      if (this.isCouncil > -1) {
        const name = this.user.account.address;
        console.log("发起移除成员者：", name);
        //console.log(this.user.account.name, "row");
        let datele = asch.deleteCouncil(
          row.name,
          name,
          this.user.secret,
          this.secondPwd
        );
        let res = await this.broadcastTransaction(datele);
        if (res.success === true) {
          toast(this.$t("INF_TRANSFER_SUCCESS"));
          return true;
        } else {
          translateErrMsg(this.$t, res.error);
          return false;
        }
      } else {
        toast("没有权限");
      }
    },
    convertFrequency(val) {
      return Math.floor(val / 8640);
    },
    compileTimeStamp(timestamp) {
      return compileTimeStamp(timestamp);
    },
    getTimeFromHight(height) {
      return getTimeFromHight(this.latestBlock, height);
    },

    viewAccountInfo(row) {
      this.$root.$emit("openAccountModal", row);
    }
  },
  computed: {
    ...mapGetters(["latestBlock", "userInfo"]),
    gatewayDetailClass() {
      return this.isDesk
        ? "col-md-6 col-xs-12"
        : "col-md-6 col-xs-12 margin-top-minus-28";
    },
    councilAccount() {
      return {
        address: this.address,
        account: {
          address: this.address
        }
      };
    }
  },
  homeTopRightClass() {
    return this.isDesk
      ? "col-md-6 col-xs-12 row justify-end items-center"
      : "col-md-6 col-xs-12 row justify-center items-center";
  },
  watch: {
    userInfo(val) {
      if (val) {
        this.loadData();
        this.getGroupAccount();
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.home-top-btn-container:hover i {
  color: #43aea8 !important;
}

.home-top-btn-container {
  display: inline-block;
}

.btn-container-line {
  margin: 0 20px;
  display: inline-block;
  width: 1px;
  height: 30px;
  vertical-align: middle;
  background: #ccc;
}

.clearflex:after {
  content: '';
  clear: both;
}

.right {
  float: right;
}

.left {
  float: left;
}

#animationWindow {
  width: 100%;
  height: 100%;
}

.mengceng {
  display: block;
  z-index: 2;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
}

.childMen {
  position: absolute;
  display: block;
  width: 600px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  z-Index: 3;
  border-radius: 12px;
  text-align: center;
  color: #555;
}

.filpTishi {
  width: 100%;
  height: 50px;
  padding: 0px 10px;
  background: #43AEA8;
  color: #fff;
  font-weight: 600;
  line-height: 50px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  border-radius: 12px 12px 0 0;
}

.dongtaiCon {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.inputlist {
  width: 100%;
  height: 40px;
  margin-bottom: 20px;
}

.inputlist:first-child {
  margin-top: 20px;
}

.inputlist input {
  width: 70%;
  height: 30px;
  box-sizing: border-box;
  border: 0;
  outline: none;
  border-bottom: 1px solid #ccc;
}

.inputlist input:focus {
  width: 70%;
  border-bottom: 1px solid #3796EF;
  transform: all 0.5s;
}

.bottomLi {
  width: 100%;
  margin-bottom: 20px;
}

.disInput {
  width: 70%;
  padding: 20px;
  text-align: left;
  display: inline-block;
  position: relative;
  background: #e7e8ee;
  box-sizing: border-box;
}

.feiyongTop {
  padding: 0 10px 10px 10px;
  height: 30px;
  line-height: 30px;
  border-bottom: 1px solid #999;
}

.topleft {
  font-size: 12px;
  color: #000;
}

.topright {
  font-size: 16px;
  color: #aaa;
}

.bottomText {
  margin-top: 10px;
  color: #000;
}

.listSpan {
  display: inline-block;
  text-align: right;
  width: 15%;
  vertical-align: top;
}

.btnCommon {
  width: 50%;
  height: 50px;
  line-height: 50px;
  float: left;
  border-top: 1px solid #eee;
  background: #fff;
  color: #3796EF;
  padding: 0;
  cursor: pointer;
  border-radius: 12px;
}

.btnCommon:last-child {
  color: #43AEA8;
}

.gatewayDetail-container {
  padding: 20px;

  .gatewayDetail-content {
    background: #ffffff !important;
    padding-bottom: 20px;
    border-radius: 6px;

    .title-line {
      padding: 12px 16px 28px;
    }

    .pool-container {
      margin: 0px 0px 30px -32px;
    }

    .council-list {
      .q-list-header {
        padding: 23px 16px !important;
      }

      .q-item:last-child {
        border: none;
      }

      .q-item {
        border-bottom: 1px solid #dddddd;
      }
    }

    .card-main-icon {
      position: absolute;
      right: 14px;
      bottom: 14px;

      .buy-back-icon {
        width: 57px;
      }

      .burn-icon {
        width: 40px;
      }
    }
  }
}

.q-table-top {
  background: #e7ebee !important;
}

.gateway-modal-right-card {
  height: 50%;
}

.modal-right-container {
  background: #ffffff;
  height: calc(100% - 10px);
}

.modal-right-container-bottom {
  margin-top: 10px;
}

.bottom-container-top {
  width: 100%;
}

.bottom-container-bottom {
  width: 100%;
  text-align: center;
}

.q-table-container {
  background: #ffffff;
}

.word-wrap-break {
  word-wrap: break-word;
}

.margin-top-minus-28 {
  margin-top: -28px;
}
</style>

