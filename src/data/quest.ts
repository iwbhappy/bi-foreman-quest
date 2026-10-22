// Утверждённый контент продукта; любые изменения фиксирует снимок src/tests/__snapshots__/content.test.ts.snap
import type { Npc, SceneMeta, Consequence, Callback, IndicatorId, LocationId } from '../lib/types';

export const NPCS: Record<string, Npc> = {
  "boss": {
    "id": "boss",
    "emoji": "👨‍💼",
    "name": "Ерлан Сапарович",
    "role": "начальник участка",
    "helmet": "#FFFFFF"
  },
  "foreman": {
    "id": "foreman",
    "emoji": "👷",
    "name": "Сергей Петрович",
    "role": "бригадир бетонщиков",
    "helmet": "#F28C28"
  },
  "surveyor": {
    "id": "surveyor",
    "emoji": "👩‍🔬",
    "name": "Айдана",
    "role": "геодезист",
    "helmet": "#1668B8"
  },
  "storekeeper": {
    "id": "storekeeper",
    "emoji": "🧑‍🔧",
    "name": "Бауыржан",
    "role": "кладовщик",
    "helmet": "#F2C230"
  },
  "electric": {
    "id": "electric",
    "emoji": "🧑‍🏭",
    "name": "Данияр",
    "role": "бригадир электриков (подрядчик)",
    "helmet": "#F2C230"
  },
  "finisher": {
    "id": "finisher",
    "emoji": "👨‍🎨",
    "name": "Марат",
    "role": "бригадир отделочников",
    "helmet": "#F28C28"
  },
  "pm": {
    "id": "pm",
    "emoji": "🧔",
    "name": "Асхат Нурланович",
    "role": "руководитель проекта",
    "helmet": "#FFFFFF"
  },
  "pto": {
    "id": "pto",
    "emoji": "👩‍💻",
    "name": "Жанна",
    "role": "инженер ПТО",
    "helmet": "#1668B8"
  },
  "mentor": {
    "id": "mentor",
    "emoji": "👩‍🏫",
    "name": "Гульнара",
    "role": "наставник BI Academy",
    "helmet": "#1668B8"
  }
};

export const SCENES: Record<string, SceneMeta> = {
  "q01": {
    "questionId": "q01",
    "location": "office",
    "npcLines": [
      {
        "npcId": "boss",
        "text": "Так, сегодня бетонируем перекрытие на третьей захватке. Вопросы есть?"
      }
    ]
  },
  "q02": {
    "questionId": "q02",
    "location": "mixer",
    "npcLines": [
      {
        "npcId": "foreman",
        "text": "Миксер пришёл! Ребята у опалубки, начинаем?"
      }
    ]
  },
  "q03": {
    "questionId": "q03",
    "location": "slab",
    "npcLines": [
      {
        "npcId": "surveyor",
        "text": "Проверила дважды: факт расходится с чертежом на 40 миллиметров."
      }
    ]
  },
  "q04": {
    "questionId": "q04",
    "location": "cabin",
    "npcLines": [
      {
        "npcId": "mentor",
        "text": "Скажи честно, насколько это про тебя?"
      }
    ]
  },
  "q05": {
    "questionId": "q05",
    "location": "height",
    "npcLines": [],
    "alert": "⚠ Вы замечаете нарушение"
  },
  "q06": {
    "questionId": "q06",
    "location": "floor",
    "npcLines": [
      {
        "npcId": "electric",
        "text": "Нам кабель тянуть, а они тут шпаклюют!"
      },
      {
        "npcId": "finisher",
        "text": "А нам стены в пятницу сдавать!"
      }
    ]
  },
  "q07": {
    "questionId": "q07",
    "location": "warehouse",
    "npcLines": [
      {
        "npcId": "storekeeper",
        "text": "Арматуру по вашей заявке приняли, всё сходится с накладной."
      }
    ]
  },
  "q08": {
    "questionId": "q08",
    "location": "cabin",
    "npcLines": [
      {
        "npcId": "mentor",
        "text": "Ещё один вопрос, без правильных ответов."
      }
    ]
  },
  "q09": {
    "questionId": "q09",
    "location": "meeting",
    "npcLines": [
      {
        "npcId": "boss",
        "text": "Заказчик просит сдать этаж на неделю раньше. Что скажешь?"
      }
    ]
  },
  "q10": {
    "questionId": "q10",
    "location": "meeting",
    "npcLines": [
      {
        "npcId": "pm",
        "text": "Разбивка осей на вашем участке — с ошибкой. Как так вышло?"
      }
    ]
  },
  "q11": {
    "questionId": "q11",
    "location": "cabin",
    "npcLines": [
      {
        "npcId": "mentor",
        "text": "Устал? Последняя треть дня. Насколько ты согласен с этим?"
      }
    ]
  },
  "q12": {
    "questionId": "q12",
    "location": "ptoOffice",
    "npcLines": [
      {
        "npcId": "pto",
        "text": "Завтра закрываем КС-2. По двум захваткам исполнительной всё ещё нет."
      }
    ]
  },
  "q13": {
    "questionId": "q13",
    "location": "floor",
    "npcLines": [
      {
        "npcId": "foreman",
        "text": "Да зачем нам этот планшет? Бумага сто лет работала!"
      }
    ]
  },
  "q14": {
    "questionId": "q14",
    "location": "cabin",
    "npcLines": [
      {
        "npcId": "mentor",
        "text": "Смена почти закончилась. Последний вопрос от меня."
      }
    ]
  },
  "q15": {
    "questionId": "q15",
    "location": "office",
    "npcLines": [
      {
        "npcId": "mentor",
        "text": "Есть модуль по BIM-моделированию. Необязательный — решай сам."
      }
    ]
  }
};

export const CONSEQUENCES: Consequence[] = [
  {
    "questionId": "q01",
    "optionId": "A",
    "text": "Начальник участка нахмурился, но перенёс бетон на после обеда. Бригада получила другую задачу.",
    "deltas": {
      "schedule": -5,
      "quality": 10
    }
  },
  {
    "questionId": "q01",
    "optionId": "B",
    "text": "Начальник оценил, что вы не стали спорить при всех. Бетон перенесли, но бригада полчаса ждала новую задачу.",
    "deltas": {
      "schedule": -10,
      "quality": 10,
      "team": 5
    }
  },
  {
    "questionId": "q01",
    "optionId": "C",
    "text": "Технадзор приехал через час и принял армирование с двумя замечаниями. Устраняли на ходу — бетон пошёл по графику.",
    "deltas": {
      "schedule": 5,
      "quality": -5,
      "team": 5
    }
  },
  {
    "questionId": "q01",
    "optionId": "D",
    "text": "Запись в журнале остановила заливку. Пока руководство решало, бригада простояла полтора часа.",
    "deltas": {
      "schedule": -10,
      "quality": 10,
      "safety": 5,
      "team": -5
    }
  },
  {
    "questionId": "q02",
    "optionId": "A",
    "text": "Осадка конуса за пределами нормы — машину вернули. Бригада простояла два часа, но перекрытие не придётся вскрывать.",
    "deltas": {
      "schedule": -10,
      "quality": 10,
      "team": -5
    }
  },
  {
    "questionId": "q02",
    "optionId": "B",
    "text": "Завод признал пересортицу и обещал замену через час. Документы в порядке, бригада ждёт.",
    "deltas": {
      "schedule": -5,
      "quality": 5,
      "team": -5
    }
  },
  {
    "questionId": "q02",
    "optionId": "C",
    "text": "Бригадир махнул рукой: «Нормальный бетон, у них зимняя добавка». Залили, время покажет.",
    "deltas": {
      "schedule": 5,
      "quality": -5,
      "team": 5
    }
  },
  {
    "questionId": "q02",
    "optionId": "D",
    "text": "Залили по графику. Образцы-кубики уехали в лабораторию — результат будет через 7 дней.",
    "deltas": {
      "schedule": 10,
      "quality": -10,
      "team": 5
    }
  },
  {
    "questionId": "q03",
    "optionId": "A",
    "text": "Два часа вы с бригадиром сидели над узлом. Проектировщик ответил быстрее обещанного: «Согласовано, с одной правкой».",
    "deltas": {
      "schedule": -10,
      "quality": 5,
      "team": 10
    }
  },
  {
    "questionId": "q03",
    "optionId": "B",
    "text": "Бригада перешла на соседний фронт. Темп упал, но узел никто не испортил.",
    "deltas": {
      "schedule": -10,
      "quality": 10
    }
  },
  {
    "questionId": "q03",
    "optionId": "C",
    "text": "Работы продолжились без остановки. Проектировщик о расхождении пока не знает.",
    "deltas": {
      "schedule": 10,
      "quality": -10
    }
  },
  {
    "questionId": "q03",
    "optionId": "D",
    "text": "ГИП обещал ответ к вечеру. До этого узел стоит, бригада ворчит.",
    "deltas": {
      "schedule": -5,
      "quality": 5,
      "team": -5
    }
  },
  {
    "questionId": "q05",
    "optionId": "A",
    "text": "Монтажник перестегнулся и поблагодарил. Вы потеряли 20 минут, зато бригада подрядчика теперь сама следит за точками крепления.",
    "deltas": {
      "schedule": -5,
      "safety": 10,
      "team": 5
    }
  },
  {
    "questionId": "q05",
    "optionId": "B",
    "text": "Предписание выдано, подрядчик проведёт внеплановый инструктаж. Отношения с их прорабом стали прохладнее.",
    "deltas": {
      "safety": 10,
      "team": -5
    }
  },
  {
    "questionId": "q05",
    "optionId": "C",
    "text": "Выяснилось: анкерных точек на этой отметке действительно не хватает. Добавили две, работа стояла час.",
    "deltas": {
      "schedule": -10,
      "quality": 5,
      "safety": 10
    }
  },
  {
    "questionId": "q05",
    "optionId": "D",
    "text": "Прораб подрядчика обещал разобраться. Монтажник перестегнулся, вы сэкономили время, но их бригада недовольна, что вы «через голову».",
    "deltas": {
      "schedule": 5,
      "safety": 5,
      "team": -5
    }
  },
  {
    "questionId": "q06",
    "optionId": "A",
    "text": "Договорились за 15 минут: электрики работают с утра, отделочники после обеда. Оба довольны, но сегодня половина дня потеряна.",
    "deltas": {
      "schedule": -5,
      "team": 10
    }
  },
  {
    "questionId": "q06",
    "optionId": "B",
    "text": "Решение принято за минуту по ППР — очерёдность безопасная. Бригадир электриков недоволен.",
    "deltas": {
      "schedule": 5,
      "safety": 5,
      "team": -5
    }
  },
  {
    "questionId": "q06",
    "optionId": "C",
    "text": "Отделка не на критическом пути — приоритет у электриков. Отделочники ушли на другой этаж обиженными, но график объекта не пострадал.",
    "deltas": {
      "schedule": 10,
      "team": -10
    }
  },
  {
    "questionId": "q06",
    "optionId": "D",
    "text": "Вопрос попадёт в протокол межподрядной координации, но решат его только завтра. Сегодня бригады продолжают мешать друг другу.",
    "deltas": {
      "schedule": -5,
      "quality": 5
    }
  },
  {
    "questionId": "q07",
    "optionId": "A",
    "text": "Руководитель поворчал, но ваш план сработал: металл со склада соседнего объекта привезли к вечеру.",
    "deltas": {
      "schedule": -5,
      "quality": 5,
      "team": 5
    }
  },
  {
    "questionId": "q07",
    "optionId": "B",
    "text": "Дозаявку провели, порядок работ перестроили — простоя не было. Снабженцы недовольны срочностью.",
    "deltas": {
      "schedule": 5,
      "team": -5
    }
  },
  {
    "questionId": "q07",
    "optionId": "C",
    "text": "Дозаявку провели по регламенту — металл будет через два дня. Бригада переходит на другие работы.",
    "deltas": {
      "schedule": -10,
      "quality": 10
    }
  },
  {
    "questionId": "q07",
    "optionId": "D",
    "text": "Оказалось, программа округлила спецификацию. Вы нашли системную ошибку, но доложили только к концу дня.",
    "deltas": {
      "schedule": -5,
      "quality": 10,
      "team": -5
    }
  },
  {
    "questionId": "q09",
    "optionId": "A",
    "text": "Заказчик недоволен, но расчёт убедил: срок оставили прежним.",
    "deltas": {
      "quality": 5,
      "team": -5
    }
  },
  {
    "questionId": "q09",
    "optionId": "B",
    "text": "План утвердили. Бригады выходят во вторую смену: люди устанут, но этаж будет раньше.",
    "deltas": {
      "schedule": 10,
      "safety": -5,
      "team": -5
    }
  },
  {
    "questionId": "q09",
    "optionId": "C",
    "text": "Срок сдвинули на неделю раньше. Как именно успеть — решать будем по ходу.",
    "deltas": {
      "schedule": 5,
      "quality": -5
    }
  },
  {
    "questionId": "q09",
    "optionId": "D",
    "text": "Начальник дал день. Завтра ваш ответ будет точным, а заказчик пока ждёт.",
    "deltas": {
      "schedule": -5,
      "quality": 5
    }
  },
  {
    "questionId": "q10",
    "optionId": "A",
    "text": "Руководитель попросил геодезистов перепроверить свою часть. Геодезисты обиделись, но картина стала честной.",
    "deltas": {
      "quality": 10,
      "team": -5
    }
  },
  {
    "questionId": "q10",
    "optionId": "B",
    "text": "Разбор закончился быстро. Вечером вы сами перепроверили все оси на участке.",
    "deltas": {
      "schedule": -5,
      "quality": 5
    }
  },
  {
    "questionId": "q10",
    "optionId": "C",
    "text": "Данные съёмки показали картину целиком. Руководитель принял их, но атмосфера накалилась.",
    "deltas": {
      "quality": 5,
      "team": -10
    }
  },
  {
    "questionId": "q10",
    "optionId": "D",
    "text": "Предложение приняли и распространили на весь объект. Работы у всех чуть прибавилось.",
    "deltas": {
      "schedule": -10,
      "quality": 10,
      "team": 5
    }
  },
  {
    "questionId": "q12",
    "optionId": "A",
    "text": "Вы ушли с объекта в 23:00, но всё закрыто. Завтра будет тяжело.",
    "deltas": {
      "schedule": 5,
      "quality": 5,
      "safety": -5
    }
  },
  {
    "questionId": "q12",
    "optionId": "B",
    "text": "Мастера получили задачи со сроками. К пятнице документы будут закрыты, двое мастеров ворчат.",
    "deltas": {
      "schedule": 5,
      "quality": 5,
      "team": -5
    }
  },
  {
    "questionId": "q12",
    "optionId": "C",
    "text": "Часть актов закрыта, по остальным согласована новая дата. Финансовый отдел недоволен сдвигом.",
    "deltas": {
      "schedule": -5,
      "quality": 5
    }
  },
  {
    "questionId": "q12",
    "optionId": "D",
    "text": "Чек-лист понравился: со следующего месяца его возьмут три участка. В этом месяце долги остались.",
    "deltas": {
      "schedule": -10,
      "quality": 5,
      "team": 5
    }
  },
  {
    "questionId": "q13",
    "optionId": "A",
    "text": "Бригадиры понемногу втянулись: вы показали, как фотографировать дефекты прямо в акт.",
    "deltas": {
      "schedule": -5,
      "team": 10
    }
  },
  {
    "questionId": "q13",
    "optionId": "B",
    "text": "Все работают в системе по инструкции. Бригадиры недовольны, зато данные чистые.",
    "deltas": {
      "quality": 10,
      "team": -10
    }
  },
  {
    "questionId": "q13",
    "optionId": "C",
    "text": "Разработчики взяли три замечания в ближайшее обновление. Бригадиры видят, что их услышали, но пока система неудобная.",
    "deltas": {
      "schedule": -5,
      "quality": 5,
      "team": 5
    }
  },
  {
    "questionId": "q13",
    "optionId": "D",
    "text": "Двойная работа съедает время, но когда планшет завис, бумажный журнал выручил.",
    "deltas": {
      "schedule": -10,
      "quality": 5
    }
  },
  {
    "questionId": "q15",
    "optionId": "A",
    "text": "Вы записаны. Первое занятие — в субботу.",
    "deltas": {}
  },
  {
    "questionId": "q15",
    "optionId": "B",
    "text": "Программа курса скачана — изучите её на выходных.",
    "deltas": {}
  },
  {
    "questionId": "q15",
    "optionId": "C",
    "text": "Вы записаны, а в календаре появились три вечера для занятий.",
    "deltas": {}
  },
  {
    "questionId": "q15",
    "optionId": "D",
    "text": "Трое коллег с участка готовы учиться вместе с вами.",
    "deltas": {}
  }
];

export const CALLBACKS: Callback[] = [
  {
    "atQuestionId": "q06",
    "dependsOn": "q05",
    "textByOption": {
      "C": "Вы возвращаетесь со склада, где согласовали новые анкерные точки, и вас перехватывают два бригадира.",
      "A": "Вы спускаетесь с отметки +18, и вас перехватывают два бригадира.",
      "B": "Вы спускаетесь с отметки +18, и вас перехватывают два бригадира.",
      "D": "Вы спускаетесь с отметки +18, и вас перехватывают два бригадира."
    }
  },
  {
    "atQuestionId": "q10",
    "dependsOn": "q03",
    "textByOption": {
      "A": "Проектировщик уже прислал согласование вашего узла. Но на разборе речь пойдёт о другом.",
      "C": "Расхождение в 40 мм на утреннем узле пока никто не заметил. Но на разборе речь пойдёт о другом.",
      "B": "Ответа по утреннему узлу всё ещё нет. А на разборе речь пойдёт о другом.",
      "D": "Ответа по утреннему узлу всё ещё нет. А на разборе речь пойдёт о другом."
    }
  },
  {
    "atQuestionId": "q12",
    "dependsOn": "q02",
    "textByOption": {
      "A": "Завод прислал письмо: утренняя партия бетона действительно была с отклонением, её заменили.",
      "B": "Завод прислал письмо: утренняя партия бетона действительно была с отклонением, её заменили.",
      "C": "Кубики из утреннего бетона в лаборатории. Результат — через неделю.",
      "D": "Кубики из утреннего бетона в лаборатории. Результат — через неделю."
    }
  },
  {
    "atQuestionId": "q13",
    "dependsOn": "q09",
    "textByOption": {
      "B": "Вечерняя смена, которую вы предложили, уже собирается у ворот.",
      "A": "Дневная смена собирается домой.",
      "C": "Дневная смена собирается домой.",
      "D": "Дневная смена собирается домой."
    }
  }
];

export const MENTOR_INTROS: Record<string, string> = {
  "q04": "Скажи честно, насколько это про тебя?",
  "q08": "Ещё один вопрос, без правильных ответов.",
  "q11": "Устал? Последняя треть дня. Насколько ты согласен с этим?",
  "q14": "Смена почти закончилась. Последний вопрос от меня."
};

export const EPILOGUES: Record<IndicatorId, string> = {
  "safety": "Все вернулись домой целыми. Это главный результат любой смены.",
  "quality": "Всё, что сделано сегодня, переделывать не придётся.",
  "team": "Бригады уходят с объекта, договорившись на завтра.",
  "schedule": "Объект идёт с опережением графика."
};

export const MENTOR_NARRATIONS: Record<string, string> = {
  "q04": "Перерыв. Гульнара присаживается рядом с чаем.",
  "q08": "Гульнара листает свой блокнот.",
  "q11": "",
  "q14": ""
};

export const START_INDICATORS: Record<IndicatorId, number> = {
  "schedule": 80,
  "quality": 30,
  "safety": 60,
  "team": 65
};

export const MORNING_CONTEXT = "Утро на объекте: график в норме, по качеству — открытые замечания технадзора";

export const LOCATIONS: Record<LocationId, string> = {
  "office": "Прорабская",
  "slab": "Перекрытие 3-й захватки",
  "mixer": "Въезд на площадку",
  "height": "Отметка +18",
  "floor": "Этаж 7, отделка",
  "warehouse": "Склад",
  "meeting": "Переговорная",
  "ptoOffice": "Офис ПТО",
  "cabin": "Бытовка · перерыв"
};

export const SHIFT_DISCLAIMER = "Идеальной смены не бывает: каждое решение что-то даёт и чем-то жертвует. Показатели объекта не влияют на ваш профиль — он строится только по тому, *как* вы принимали решения.";

export const HELMET_COLORS = [
  {
    "name": "оранжевый",
    "color": "#F28C28"
  },
  {
    "name": "белый",
    "color": "#FFFFFF"
  },
  {
    "name": "синий",
    "color": "#1668B8"
  },
  {
    "name": "жёлтый",
    "color": "#F2C230"
  }
];

export const INDICATORS: { id: IndicatorId; name: string; emoji: string }[] = [
  {
    "id": "schedule",
    "name": "Сроки",
    "emoji": "⏱"
  },
  {
    "id": "quality",
    "name": "Качество",
    "emoji": "📐"
  },
  {
    "id": "safety",
    "name": "Безопасность",
    "emoji": "⛑"
  },
  {
    "id": "team",
    "name": "Команда",
    "emoji": "🤝"
  }
];

export const SKY_PALETTES = [
  {
    "fromHour": 7,
    "toHour": 9,
    "top": "#FFD8A8",
    "bottom": "#BFE3FF"
  },
  {
    "fromHour": 9,
    "toHour": 16,
    "top": "#8EC9FF",
    "bottom": "#E6F4FF"
  },
  {
    "fromHour": 16,
    "toHour": 18,
    "top": "#FFC48A",
    "bottom": "#9BC8F0"
  },
  {
    "fromHour": 18,
    "toHour": 20,
    "top": "#F28C28",
    "bottom": "#3B4C7A"
  }
];

