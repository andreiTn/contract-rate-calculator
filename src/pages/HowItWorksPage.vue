<template>
  <article class="prose">
    <h1>How this works</h1>
    <p>This app estimates what you keep from a contract billed by a Romanian limited company (SRL). It is a negotiation aid. It is not tax, accounting, or legal advice.</p>

    <h2>What you enter</h2>
    <p>You enter the contract, the days you do not bill, your salary, and your costs. Each money field has its own currency. A yearly contract can be in pounds while a software cost stays in lei.</p>
    <p>The tax sums are done in RON. A foreign amount is turned into lei with the BNR rate for that day. The rate line in the header shows the date. If the rate cannot be loaded within a few seconds, new amounts stay in RON.</p>

    <h2>Days off</h2>
    <p>Billable days are the weekdays in the year, minus the days off you enter. Those days already include vacation and weekday public holidays.</p>
    <p>A monthly or yearly contract is invoiced in full, even in a month when you take time off. Days off change only the hourly, daily, and weekly figures.</p>

    <h2>The two company taxes</h2>
    <p>Micro tax is a percent of invoiced revenue. Costs do not reduce it. Profit tax is a percent of what is left after costs and the employer salary cost.</p>
    <p>If revenue is above the micro cap, the app warns you. It does not switch the tax for you.</p>

    <h2>What you keep</h2>
    <p>Dividend tax comes off the profit you take out. The health contribution (CASS) is a personal cost, in fixed steps, once dividend cash and other income of the same kind cross a ceiling. Salary health contributions do not reduce it.</p>
    <p>Your net salary is extra. It is not part of the dividend. The company also pays the employer cost of that salary.</p>
    <p>Pension CAS on the payslip is part of the salary. This app does not add a second pension contribution on dividends.</p>

    <h2>The target tab</h2>
    <p>You can type the dividend cash you want to keep, in any of the four currencies. The app works backwards to the contract revenue that would leave you that amount, after dividend tax and the health contribution. Salary net is added on top.</p>

    <h2>Saved on this browser</h2>
    <p>Your figures are stored in this browser with IndexedDB, and mirrored in local storage when that works. Nothing is sent to an account. The first visit asks for the contract, days off, salary, and monthly costs. Later visits open the calculator directly.</p>
    <p>Exchange rates are loaded from cupiu.ro, which republishes the BNR fixing. That request leaves this browser. Your contract amounts do not.</p>
  </article>
</template>
