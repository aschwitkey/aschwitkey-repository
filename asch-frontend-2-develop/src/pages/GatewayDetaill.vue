<template>
  <q-page class="gatewayDetail-container">
    <!-- <tip-bar class="padding-0 margin-bottom-20" v-if="tipBarShow" :ratio="gateway.bail.ratio*100" :status="ratioStatus" :symbol="gateway.bail.symbol"/> -->
    <div class="gatewayDetail-content">
      <div class="no-wrap q-pa-md row justify-between">
        <span>
          <i class="material-icons vertical-align-sub font-18 text-black">border_color</i>
          <h5 class="q-px-md inline-block q-my-none font-18">{{$t('GATEWAY_PARTICULARS')}}</h5>
        </span>
        <q-btn
          color="secondary"
          class="self-center"
          @click="$router.push('gateway')"
        >
          <q-icon name="reply" />
        </q-btn>
      </div>
      <div class="title-line">
        <boundary-line />
      </div>
      <div
        class="row q-px-md"
        :class="isDesk?'gutter-md':'gutter-xs'"
      >
        <div class="col-md-8 col-xs-12 flex-initial">
          <q-card
            class="mobile-only no-shadow margin-bottom-20"
            align="left"
          >
            <div class="bg-white shadow-2">
              <q-card-title class="bg-nine">
                <div class="row justify-between">
                  <span class="font-16 text-tertiary">{{$t('BASIC_INFO')}}</span>
                  <a
                    class="cursor-pointer text-secondary font-12"
                    href="https://www.asch.io/docs"
                    target="_blanck"
                  >
                    {{$t('GATEWAY_MEMBER_AWARD')}}
                    <i class="material-icons vertical-align-sub font-14 text-secondary">help</i>
                  </a>
                </div>
              </q-card-title>
              <q-card-main class="word-wrap-break">
                <div
                  v-if="gateway"
                  class="font-24 text-secondary font-bold"
                >{{gateway.name}} {{$t('GATEWAY')}}</div>
                <div class="margin-top-10">
                  <span class="font-16 text-five font-bold">{{$t('GATEWAY_STATUS')}}：</span>
                  <span
                    class="font-16"
                    :class="getGatewayState === 2 ? 'text-secondary':'text-red'"
                  >{{getGatewayState === 2 ? 'online':'offline'}}</span>
                </div>
                <div class="margin-top-10 gateway-desc-container">
                  <span class="font-16 text-five font-bold">{{$t('DAPP_DESCRIPTION')}}：</span>
                  <span class="font-16 text-five word-break-all">{{gateway?gateway.desc:''}}</span>
                </div>
                <div class="margin-top-10">
                  <q-btn
                    class="custom-btn"
                    :disable="isClickToApply"
                    color="secondary"
                    :label="getBtnMessage"
                    @click="toApplyGateway"
                  />
                </div>
              </q-card-main>
            </div>
          </q-card>

          <q-table
            :title="$t('COUNCIL_PAGE.MODAL_TITLE', {number: datas.length})"
            class="fixed-height custom-table-top height-100 "
            :class="isDesk?'custom-height-352':'custom-height-250'"
            :data="datas"
            :columns="columns"
            :pagination.sync="pagination"
            @request="request"
            :loading="loading"
            row-key="address"
            :rows-per-page-options="[10]"
            hide-bottom
          >
            <template
              slot="top-left"
              slot-scope="props"
            >
              <button
                :class="isDesk?memberType === 1 ? styleSelected : styleUnselected:memberType === 1 ? styleSelectedMobile : styleUnselectedMobile"
                @click="changeType(1)"
              >
                {{$t('COUNCIL_MEMBER_ELECTED', {number: electedNum})}}
              </button>
              <button
                :class="isDesk?memberType === 0 ? styleSelected : styleUnselected:memberType === 0 ? styleSelectedMobile : styleUnselectedMobile"
                @click="changeType(0)"
              >
                {{$t('COUNCIL_MEMBER_CANDIDATE', {number: candidateNum})}}
              </button>
            </template>
            <q-td
              slot="body-cell-address"
              slot-scope="props"
              :props="props"
            >
              <div
                class="text-secondary cursor-pointer"
                @click="viewAccountInfo(props.row)"
              >
                {{props.value}}
              </div>
            </q-td>
            <q-td
              slot="body-cell-timestamp"
              slot-scope="props"
              :props="props"
            >
              {{fullTimestamp(props.value)}}
            </q-td>
            <q-td
              slot="body-cell-bail"
              slot-scope="props"
              :props="props"
            >
              {{convertFee(props.value)}}
            </q-td>
          </q-table>
        </div>

        <div
          class="flex-initial"
          v-if="gateway"
          :class="gatewayDetailClass"
        >
          <q-card
            class="desktop-only no-shadow"
            align="left"
          >
            <div class="bg-white shadow-2 fixed-height">
              <q-card-title class=" bg-nine custom-card-title">
                <div class="row justify-between">
                  <span class="font-16 text-tertiary">{{$t('BASIC_INFO')}}</span>
                  <span class="font-12 text-secondary valid-amount gateway-member-award">
                    {{$t('GATEWAY_MEMBER_AWARD')}}
                    <a
                      class="cursor-pointer"
                      href="https://www.asch.io/docs"
                      target="_blanck"
                    >
                      <i class="material-icons vertical-align-sub font-14 text-secondary">help</i>
                    </a>
                  </span>
                </div>
              </q-card-title>
              <q-card-main class="gateway-info-container">
                <div class="font-30 text-secondary font-bold">{{gateway.name}} {{$t('GATEWAY')}}</div>
                <div class="margin-top-30">
                  <span class="font-16 text-five font-bold">{{$t('GATEWAY_STATUS')}}：</span>
                  <span
                    class="font-16"
                    :class="getGatewayState === 2 ? 'text-secondary':'text-red'"
                  >{{getGatewayState === 2 ? 'online':'offline'}}</span>
                </div>
                <div class="margin-top-15 gateway-desc-container">
                  <span class="font-16 text-five font-bold">{{$t('DAPP_DESCRIPTION')}}：</span>
                  <span class="font-16 text-five word-break-all">{{gateway?gateway.desc:''}}</span>
                </div>
                <div class="margin-top-15">
                  <q-btn
                    class="custom-btn"
                    :disable="isClickToApply"
                    color="secondary"
                    :label="getBtnMessage"
                    @click="toApplyGateway"
                  />
                </div>
              </q-card-main>
            </div>
          </q-card>
        </div>
      </div>
      <div
        class="row q-px-md"
        :class="isDesk?'gutter-md':'gutter-xs'"
      >
        <q-card
          class="no-shadow margin-top-30 col-md-4 col-xs-12"
          align="left"
        >
          <div
            class="bg-white shadow-2"
            :class="isDesk?' fixed-info-height':'padding-bottom-20'"
          >
            <q-card-title class="bg-nine custom-card-title">
              <span class="font-16 text-tertiary font-weight">{{$t('RESERVE_TOTAL_AMOUNT')}} </span>
              <!-- <span
                v-if="gateway"
                class="font-12 text-secondary valid-amount"
              >
                {{$t('AVALABLE_BAIL_AMOUNT')}}
                {{gateway.bail.bail | fee}}
              </span>
              <span
                v-else
                class="font-12 text-secondary valid-amount"
              >{{$t('AVALABLE_BAIL_AMOUNT')}} 0</span> -->
            </q-card-title>
            <q-card-main :class="isDesk?'custom-card-main':'custom-card-main-mobile'">
              <div class="word-break-all">
                <span class="font-24 text-tertiary">{{bailSum | fee}}</span>
                <span class="font-18 text-secondary"> XAS </span>
              </div>
              <div
                class="flex row margin-top-30"
                :class="getAddBtnShow&&getReturnBtnShow?'justify-between':'justify-end'"
              >
                <q-btn
                  v-show="getAddBtnShow"
                  big
                  class="col-5 padding-10"
                  :class="isDesk?'font-18':'font-14'"
                  color="secondary"
                  @click="showPromptModal(1)"
                  :label="$t('RESERVE_ADD_LABEL')"
                />
                <q-btn
                  v-show="getReturnBtnShow"
                  big
                  class="col-5 padding-10"
                  :class="isDesk?'font-18':'font-14'"
                  color="secondary"
                  @click="showPromptModal(2)"
                  :label="$t('RESERVE_RETURN_LABEL')"
                />
              </div>
            </q-card-main>
          </div>
        </q-card>
        <q-card
          class="no-shadow margin-top-30 col-md-4 col-xs-12"
          align="left"
        >
          <div
            class="bg-white shadow-2"
            :class="isDesk?' fixed-info-height':'padding-bottom-20'"
          >
            <q-card-title class="bg-nine">
              <span class="font-22 text-black font-weight">{{$t('PLEDGE_AMOUNT')}}</span>
            </q-card-title>
            <q-card-main :class="isDesk?'custom-card-main':'custom-card-main-mobile'">
              <div>
                <span class="font-24 text-tertiary">{{gateway && gateway.bail ?gateway.bail.hosting:'' | fee}} </span>
                <span class="font-18 text-secondary">{{gateway && gateway.bail ?gateway.bail.symbol:''}}</span>
              </div>
            </q-card-main>
          </div>
        </q-card>
        <q-card
          class="no-shadow margin-top-30 col-md-4 col-xs-12"
          align="left"
        >
          <div
            class="bg-white shadow-2"
            :class="isDesk?' fixed-info-height':'padding-bottom-20'"
          >
            <q-card-title class="bg-nine self-start bottom-container-top">
              <span class="font-16 text-black">{{$t('LASTEST_UPDATE_TIME')}}</span>
            </q-card-title>
            <q-card-main :class="isDesk?'custom-card-main':'custom-card-main-mobile'">
              <span class="font-24 text-five">{{gatewayTime}}</span>
            </q-card-main>
          </div>
        </q-card>
      </div>
    </div>
    <prompt-modal
      :show="modal.show"
      :title="modal.title"
      :type="modal.type"
      :gateway="gateway"
      @submit="submit"
      @close="modal.show=false"
    />
  </q-page>
</template>

<script>
import { QPage, QTable, QCard, QCardTitle, QCardMain, QBtn, QTd, QIcon, QBtnToggle } from 'quasar'
import { mapActions, mapGetters } from 'vuex'
import { fullTimestamp, convertFee } from '../utils/asch'
import {
  compileTimeStamp,
  getTimeFromHight,
  toast,
  toastWarn,
  translateErrMsg
} from '../utils/util'
import PromptModal from '../components/PromptModal'
import BoundaryLine from '../components/BoundaryLine'
import PromptMessage from '../components/PromptMessage'
// import TipBar from '../components/TipBar'

export default {
  name: 'GatewayDetail',
  props: ['userObj'],
  components: {
    QPage,
    QTable,
    QCard,
    QCardTitle,
    QCardMain,
    QBtn,
    QTd,
    QIcon,
    QBtnToggle,
    PromptModal,
    BoundaryLine,
    PromptMessage
  },
  data() {
    return {
      styleSelected: 'inner-btn text-secondary selected',
      styleUnselected: 'inner-btn text-four',
      styleSelectedMobile: 'inner-mobile-btn text-secondary selected',
      styleUnselectedMobile: 'inner-mobile-btn text-four',
      columns: [
        {
          name: 'name',
          required: true,
          label: this.$t('COUNCIL_PAGE.MEMBER'),
          align: 'center',
          field: 'name'
        },
        // {
        //   name: 'desc',
        //   required: true,
        //   label: this.$t('DESCRIBE'),
        //   align: 'center',
        //   field: 'desc'
        // },
        {
          name: 'address',
          required: true,
          label: this.$t('COUNCIL_PAGE.ADDRESS'),
          align: 'center',
          field: 'address'
        },
        {
          name: 'bail',
          required: true,
          label: this.$t('GATEWAY_PLEDGE_AMOUNT'),
          align: 'center',
          field: 'bail'
        },
        // {
        //   name: 'elected',
        //   required: true,
        //   label: this.$t('ELECTED'),
        //   align: 'center',
        //   field: 'elected'
        // },
        {
          name: 'timestamp',
          required: true,
          label: this.$t('LATEST_OP_TIME'),
          align: 'center',
          field: 'timestamp'
        }
      ],
      pagination: {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 1
      },
      loading: false,
      datas: [],
      gateway: {
        bail: null,
        status: null,
        claim: null
      },
      electedNum: 0,
      candidateNum: 0,
      memberType: 1, // elected 1 , candidate 0
      isGatewayMember: false,
      isElected: false,
      isClickToApply: false,
      modal: {
        // prompt modal for gateway
        title: '',
        type: '',
        show: false
      },
      bailSum: 0
    }
  },
  async mounted() {
    let { gateway } = this.$route.params
    if (!gateway) {
      this.$router.push('gateway')
    }
    this.gateway = gateway
    if (gateway) {
      await this.loadData()
      // let res = await this.getGatewayInfo({
      //   name: gateway.name
      // })
      // if (res.success) {
      //   this.gateway = this._.merge({}, this.gateway, {
      //     bail: res
      //   })
      // }
    }
  },
  methods: {
    ...mapActions([
      'getGatewayMembers',
      'getGatewayInfo',
      'getGatewayBailStatus',
      'getCompensation',
      'returnBailAmount',
      'addBailAmount'
    ]),
    fullTimestamp,
    convertFee,
    viewAccountInfo(row) {
      this.$root.$emit('openAccountModal', row.address)
    },
    toApplyGateway() {
      if (!this.user.account.name) {
        toastWarn(this.$t('PLEASE_SET_NAME'))
        return null
      } else if (this.user.account.isDelegate) {
        toastWarn(this.$t('AGENT_ALREADY_DELEGATE'))
      } else if (this.user.account.isAgent) {
        toastWarn(this.$t('AGENT_ALREADY'))
      } else if (this.user.account.role) {
        toastWarn(this.$t('ALREADY_GATEWAYMEMBER'))
      } else {
        this.$router.push({
          name: 'postApplyGateway',
          params: {
            gateway: this.gateway.name
          }
        })
      }
    },
    async loadData() {
      let limit = this.pagination.rowsPerPage
      let pageNo = this.pagination.page
      let res = await this.getGatewayMembers({
        limit: limit,
        offset: (pageNo - 1) * limit,
        name: this.gateway.name
      })
      let electedNume = 0
      let candidateNum = 0
      if (res.success) {
        let bailSum = 0
        this.datas = res.data.filter(p => {
          if (p.elected === 1) {
            if (this.address === p.address) {
              this.isElected = true
              this.isGatewayMember = true
            }
            electedNume++
            bailSum += p.bail
          } else {
            if (this.address === p.address) {
              this.isGatewayMember = true
            }
            candidateNum++
          }
          return p.elected === this.memberType
        })
        this.bailSum = bailSum
      }
      this.candidateNum = candidateNum
      this.electedNum = electedNume
      // let params = {
      //   name: this.gateway.name,
      //   address: this.address
      // }
      // let resStatus = await this.getGatewayBailStatus(params)
      // if (resStatus.success) {
      //   this.gateway.status = resStatus
      // }
      // let resClaim = await this.getGatewayRealClaim(params)
      // if (resClaim.success) {
      //   this.gateway.claim = resClaim
      // }
    },
    async request(props) {
      this.loading = true
      this.pagination = props.pagination
      this.filter = props.filter
      await this.loadData()
      this.loading = false
    },
    convertFrequency(val) {
      return Math.floor(val / 8640)
    },
    compileTimeStamp(timestamp) {
      return compileTimeStamp(timestamp)
    },
    getTimeFromHight(height) {
      return getTimeFromHight(this.latestBlock, height)
    },
    changeType(val) {
      this.memberType = val
      this.loadData()
    },
    showPromptModal(type) {
      const titleKeys = [
        'placeholder',
        'RESERVE_ADD_LABEL',
        'RESERVE_RETURN_LABEL',
        'RESERVE_COMPENSATION_LABEL'
      ]
      this.modal = {
        // prompt modal for gateway
        title: this.$t(titleKeys[type]),
        type: type,
        show: true
      }
    },
    async submit(form) {
      let res = null
      let { type, amount, secondPwd } = form
      let params = {
        name: this.gateway.name,
        amount,
        secondSecret: secondPwd
      }
      switch (type) {
        case 1:
          res = await this.addBailAmount(params)
          break
        case 2:
          res = await this.returnBailAmount(params)
          break
        case 3:
          res = await this.getCompensation(params)
          break
      }
      if (res.success) {
        toast(this.$t('INF_OPERATION_SUCCEEDED'))
      } else {
        translateErrMsg(this.$t, res.error)
        // this.disableBtn('btnDisable')
      }
    }
  },

  computed: {
    ...mapGetters(['latestBlock', 'userInfo']),
    userNickname() {
      if (this.user && this.user.account && this.user.account.name) {
        return this.user.account.name
      }
    },
    getBtnMessage() {
      if (this.isGatewayMember) {
        this.isClickToApply = true
        return this.$t('ALREADY_GATEWAY')
      } else {
        if (this.getGatewayState === 2 || this.getGatewayState === 0) {
          this.isClickToApply = false
          return this.$t('APPLY_FOR_GATEWAY')
        } else {
          this.isClickToApply = true
          return this.$t('SUSPEND_APPLY')
        }
      }
    },
    gatewayDetailClass() {
      return this.isDesk ? 'col-md-4 col-xs-12' : 'col-md-4 col-xs-12 margin-top-minus-28'
    },
    getGatewayState() {
      /**
       * -1 no gateway data
       * 0 not activated
       * 1 activated
       * 2 online
       * 3 offline
       * 4 freeze
       */
      if (this.gateway) {
        let { activated, revoked } = this.gateway
        if (activated === 0) {
          return 0
        }
        if (activated === 1) {
          if (revoked > 0) {
            return revoked + 2
          } else {
            return 2
          }
        }
      }
      return -1
    },
    getAddBtnShow() {
      let showStates = [0, 1, 2]
      let gatewayState = this.getGatewayState
      let flag = showStates.indexOf(gatewayState) > -1
      return flag && this.isGatewayMember
    },
    getReturnBtnShow() {
      let showStates = [0, 1, 2]
      let gatewayState = this.getGatewayState
      let flag = showStates.indexOf(gatewayState) > -1
      return flag && !this.isElected
    },
    // getCompensatioBtnShow() {
    //   let showStates = [4]
    //   let gatewayState = this.getGatewayState
    //   let flag = showStates.indexOf(gatewayState) > -1
    //   return flag
    // },
    user() {
      return this.userInfo
    },
    address() {
      return this.user.account.address
    },
    gatewayTime() {
      let gateway = this.gateway
      return gateway && gateway.createTime
        ? compileTimeStamp(gateway.createTime)
        : gateway && gateway.lastUpdateHeight
          ? getTimeFromHight(gateway.lastUpdateHeight)
          : ''
    },
    ratioStatus() {
      let gateway = this.gateway
      if (gateway && gateway.bail) {
        let ratio = this.gateway.bail.ratio
        if (ratio < 1 && ratio > 0) {
          return 2
        } else {
          return 1
        }
      }
    }
    // tipBarShow() {
    //   let gateway = this.gateway
    //   return gateway && gateway.bail && gateway.bail.ratio <= 1.2 && gateway.bail.ratio !== 0
    // }
  },
  watch: {
    userObj(val) {},
    gateway(val) {
      if (val) this.loadData()
    }
  }
}
</script>

<style lang="stylus" scoped>
.gatewayDetail-container {
  padding: 20px;

  .gatewayDetail-content {
    background: #ffffff !important;
    padding-bottom: 40px;
    border-radius: 6px;

    .title-line {
      padding: 12px 16px 28px;
    }

    .gateway-info-container {
      padding: 34px 23px;
    }

    .gateway-desc-container {
      height: 60px;
      overflow-y: scroll;

      .gateway-desc {
        word-break: break-all;
      }
    }

    .custom-card-main {
      min-height: 200px;
      padding: 60px 20px 20px;
    }

    .custom-card-main-mobile {
      padding: 20px 20px 0px;
    }

    .gateway-member-award {
      position: relative;
      margin-right: 10px;

      a {
        position: absolute;
        top: -9px;
        right: -15px;
        text-decoration: none;
      }
    }

    .gateway-desc-container {
      height: 60px;
      overflow-y: scroll;
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
  padding: 20px;
  font-size: 18px;
}

.margin-top-minus-28 {
  margin-top: -28px;
}

.fixed-height {
  // height: 355px;
  overflow-y: scroll;
}

.fixed-info-height {
  min-height: 260px;
}

.inner-btn {
  outline: none;
  background-color: rgba(0, 0, 0, 0);
  position: relative;
  height: 57px;
  width: 188px;
  font-size: 20px;
  padding: 6px 12px;
  cursor: pointer;
  border-top: none;
  border-left: none;
  border-right: 1px solid #e0e1e5;
  border-bottom: 1px solid #ffffff;
}

.inner-mobile-btn {
  outline: none;
  background-color: rgba(0, 0, 0, 0);
  position: relative;
  height: 50px;
  width: 50%;
  font-size: 14px;
  padding: 6px 12px;
  cursor: pointer;
  border-top: none;
  border-left: none;
  border-right: 1px solid #e0e1e5;
  border-bottom: 1px solid #ffffff;
}

.selected {
  bottom: -1px;
}

.text-red {
  color: red;
}

.custom-height-352 {
  height: 352px;
}

.custom-height-250 {
  height: 250px;
}
</style>
