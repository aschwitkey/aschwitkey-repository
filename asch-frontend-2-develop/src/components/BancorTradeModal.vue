<template>
  <q-modal class="deposit-modal-container" content-classes="row justify-center" v-model="isModalShow" @hide="close" :no-esc-dismiss="false" minimized>
    <span class="text-center bg-secondary text-white col-12" :class="isDesk?' trader-header':'trader-header-modile'">{{action}} <i class="material-icons float-right cancel-icon cursor-pointer" @click="close">cancel</i></span>
    <div class="trader-body">
      <div class="trader-upper">
        <q-field :label="$t('AMOUNTS') + ' :'" label-width='2' class="font-16">
          <div class="input-box row">
            <input type="number" v-model="amount" @blur="$v.amount.$touch" class="col-9 text-secondary"/>
            <div class="col-3">{{currency}}</div>
          </div>
          <div class="q-field-bottom row no-wrap errContainer" :class="appear">
            <div class="q-field-error col text-negative">{{$t('BANCOR_MODAL_ERROR_1')}}</div>
          </div>
        </q-field>
        <q-field v-if="this.secondPwd" :label="$t('TRS_TYPE_SECOND_PASSWORD') + ' :'" label-width='2'>
          <div class="input-box row">
            <input class="password" type="password" v-model="password" @blur="$v.password.$touch">
          </div>
          <div class="q-field-bottom row no-wrap errContainer" :class="appearPwd">
            <div class="q-field-error col text-negative">{{$t('BANCOR_MODAL_ERROR_2')}}</div>
          </div>
        </q-field>
      </div>
      <div class="trader-bottom">
        <table>
          <tr>
            <th>{{$t('FEES')}} :</th>
            <td class="padding-l-15">0.1%</td>
          </tr>
          <tr>
            <th>{{$t('MY_BALANCE')}} :</th>
            <td class="padding-l-15">{{balance}} {{sell}}</td>
          </tr>
          <tr>
            <th>{{$t('CURRENT_PRICE')}} :</th>
            <td class="padding-l-15">{{price}}</td>
          </tr>
        </table>
        <q-btn color="secondary" class="full-width modal-btn" @click="switchAction">{{action}} {{`（ ${sell} => ${buy} ）`}}</q-btn>
      </div>
    </div>
  </q-modal>
</template>

<script>
/* eslint-disable */
import { QModal, QField, QInput, QBtn } from 'quasar'
import { required } from 'vuelidate/lib/validators'
import { secondPwdReg } from '../utils/validators'

export default {
  name: 'BancorTradeModal',
  components: {
    QModal,
    QField,
    QInput,
    QBtn
  },
  props: ['type', 'buy', 'sell', 'balance', 'price', 'show', 'secondPwd'],
  data() {
    return {
      amount: '',
      password: ''
      // show: true
    }
  },
  validations: {
    amount: {
      required,
      lessThan(val) {
        let v = Number(val)
        let b = Number(this.balance)
        if (b >= v) {
          return true
        }
        return false
      }
    },
    password: {
      regTest(val) {
        if (this.secondPwd) {
          return secondPwdReg.test(val)
        }
        return true
      }
    }
  },
  methods: {
    close() {
      this.amount = ''
      this.$v.$reset()
      this.$emit('close')
    },
    callBuy(amount) {
      let obj = {
        amount: amount,
        password: this.password
      }
      this.$emit('buy', obj)
    },
    callSell(amount) {
      let obj = {
        amount: amount,
        password: this.password
      }
      this.$emit('sell', obj)
    },
    switchAction() {
      this.$v.$touch()
      if (this.$v.amount.$error || this.$v.password.$error) {
        return
      }
      if (this.type === 0) {
        this.callBuy(this.amount)
      } else {
        this.callSell(this.amount)
      }
    }
  },
  computed: {
    action() {
      if (this.type === 0) {
        return this.$t('BANCOR_BUTTON_BUY')
      }
      return this.$t('BANCOR_BUTTON_SELL')
    },
    isModalShow: {
      get: function() {
        return this.show
      },
      set: function(val) {
        return null
      }
    },
    appear() {
      if (this.$v.amount.$error) {
        return 'show'
      }
      return 'hide'
    },
    appearPwd() {
      if (this.$v.password.$error) {
        return 'show'
      }
      return 'hide'
    },
    currency() {
      if (this.sell) {
        if (this.sell.indexOf('.') >= 0) {
          return this.sell.split('.')[1]
        }
        return this.sell
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.deposit-modal-container {
  max-width: 100vw;
}

.trader-header {
  height: 65px;
  min-width: 560px;
  line-height: 65px;
  border-radius: 2px 2px 0px 0px;
  font-size: 22px;
}

.trader-header-modile {
  height: 65px;
  line-height: 65px;
  border-radius: 2px 2px 0px 0px;
  font-size: 22px;
}

.trader-body {
  font-size: 16px;
  background-color: white;
  padding: 45px 30px;
  width: 100%;
}

.trader-upper {
  padding: 15px 0px 30px 0;
  border-bottom: 1px dashed #DDDDDD;
  line-height: 40px;

  .input-box {
    border: 1px solid #dddddd;
    height: 40px;
    line-height: 40px;

    input {
      border: none;
      outline: none;
      padding-left: 10px;
      font-size: 18px;
    }

    div {
      font-size: 18px;
      font-weight: bold;
      border-left: 1px solid #dddddd;
      background-color: #f9f9f9;
      line-height: inherit;
      text-align: center;
    }

    .password {
      width: 100%;
    }
  }
}

.trader-bottom {
  padding: 12px 0px 5px 0px;

  table {
    text-align: left;
    font-size: 16px;
    line-height: 36px;
  }

  .modal-btn {
    margin-top: 45px;
    height: 40px;
    font-size: 18px;
  }
}

.show {
  display: block;
}

.hide {
  display: none;
}

.errContainer {
  border-top: none !important;
}

.cancel-icon {
  height: 100%;
  padding-right: 15px;
}
</style>
