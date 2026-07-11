// ==================== مدیریت اکشن دکمه‌های شیشه‌ای ====================

bot.action('btn_admin_menu', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from?.id || 0;
  
  // بررسی دسترسی بدون قفل کردن ربات
  checkPermission(userId).then(async (isAdmin) => {
    if (isAdmin) {
      await adminMenu()(ctx);
    } else {
      await ctx.reply('❌ شما دسترسی به این بخش را ندارید.');
    }
  }).catch(e => console.error(e));
});

bot.action('btn_help', async (ctx) => { await ctx.answerCbQuery(); await help()(ctx); });
bot.action('btn_start', async (ctx) => { await ctx.answerCbQuery(); await start()(ctx); });
bot.action('btn_links', async (ctx) => { await ctx.answerCbQuery(); await links()(ctx); });
bot.action('btn_about', async (ctx) => { await ctx.answerCbQuery(); await about()(ctx); });
bot.action('btn_creator', async (ctx) => { await ctx.answerCbQuery(); await creator()(ctx); });

// اکشن آمار کلی (بهینه‌شده برای جلوگیری از تاخیر)
bot.action('btn_stats', async (ctx) => {
  await ctx.answerCbQuery();
  getTotalUsersCount()
    .then(async (count) => {
      await ctx.reply(`📈 *آمار کلی ربات:*\n\n👥 تعداد کل کاربران عضو شده: ${count} نفر`);
    })
    .catch(async () => await ctx.reply(`📈 *آمار کلی ربات:*\n\n👥 تعداد کل کاربران عضو شده: 1 نفر`));
});

// اکشن آمار تفکیک شده ماهانه
bot.action('btn_monthly_stats', async (ctx) => {
  await ctx.answerCbQuery();
  getMonthlyStatsReport()
    .then(async (report) => {
      await ctx.replyWithMarkdown(report);
    })
    .catch(async () => await ctx.reply("❌ خطا در محاسبه آمار ماهانه."));
});

// اکشن لیست ادمین‌ها
bot.action('btn_list_admins', async (ctx) => {
  await ctx.answerCbQuery();
  if (Number(ctx.from?.id) === SUPER_ADMIN_ID) {
    getAdminsList()
      .then(async (list) => {
        await ctx.reply(list);
      })
      .catch(async () => await ctx.reply("خطا در دریافت لیست."));
  } else {
    await ctx.reply('❌ این بخش فقط مخصوص صاحب اصلی ربات است.');
  }
});
