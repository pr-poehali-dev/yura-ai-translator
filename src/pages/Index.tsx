import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const TRANSLATE_API_URL = 'https://functions.poehali.dev/804c924f-daed-4cfb-a74d-c1fb367ee287';
const EXTRACT_TEXT_API_URL = 'https://functions.poehali.dev/7a236db2-425a-4480-aa64-2ee4da74d621';

const Index = () => {
  const [activeSection, setActiveSection] = useState('главная');
  const [isTranslating, setIsTranslating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('Автоопределение');
  const [targetLang, setTargetLang] = useState('English');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст для перевода',
        variant: 'destructive'
      });
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const response = await fetch(TRANSLATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          source_lang: sourceLang,
          target_lang: targetLang
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка перевода');
      }

      setTranslatedText(data.translated_text);
      toast({
        title: 'Готово!',
        description: 'Текст успешно переведен'
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось перевести текст',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Ошибка',
        description: 'Поддерживаются только PDF, DOCX и TXT файлы',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 50MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    setIsExtracting(true);
    setInputText('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Content = event.target?.result as string;
        const base64Data = base64Content.split(',')[1];

        const response = await fetch(EXTRACT_TEXT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            file_content: base64Data,
            file_type: file.type
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Не удалось извлечь текст');
        }

        setInputText(data.extracted_text);
        toast({
          title: 'Готово!',
          description: `Извлечено ${data.text_length} символов из ${file.name}`
        });
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обработать файл',
        variant: 'destructive'
      });
      setSelectedFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-white/70 border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Icon name="Languages" className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Translator
              </span>
            </div>
            
            <div className="hidden md:flex gap-8">
              {['Главная', 'О нас', 'Услуги', 'Портфолио', 'Блог', 'FAQ', 'Контакты'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item.toLowerCase())}
                  className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>

            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Войти
            </Button>
          </div>
        </div>
      </nav>

      {activeSection === 'главная' && (
        <section className="pt-32 pb-20 px-6 animate-fade-in">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-scale-in">
                Переводите документы
                <br />
                с силой AI
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Мгновенный перевод документов на 100+ языков с сохранением форматирования
              </p>
            </div>

            <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 animate-scale-in">
              <div className="mb-6">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                      <Icon name="Upload" size={18} className="mr-2" />
                      Загрузить файл
                    </TabsTrigger>
                    <TabsTrigger value="text" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                      <Icon name="FileText" size={18} className="mr-2" />
                      Вставить текст
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload">
                    <div className="space-y-4">
                      <label className="block">
                        <div className="border-2 border-dashed border-purple-300 rounded-2xl p-16 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer group">
                          {isExtracting ? (
                            <>
                              <Icon name="Loader2" size={64} className="mx-auto mb-4 text-purple-500 animate-spin" />
                              <p className="text-lg font-medium text-gray-700">
                                Извлекаем текст из файла...
                              </p>
                            </>
                          ) : selectedFile ? (
                            <>
                              <Icon name="FileCheck" size={64} className="mx-auto mb-4 text-green-500" />
                              <p className="text-lg font-medium text-gray-700 mb-2">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                              </p>
                            </>
                          ) : (
                            <>
                              <Icon name="FileUp" size={64} className="mx-auto mb-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                              <p className="text-lg font-medium text-gray-700 mb-2">
                                Перетащите файл сюда или нажмите для выбора
                              </p>
                              <p className="text-sm text-gray-500">
                                PDF, DOCX, TXT до 50MB
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      {selectedFile && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedFile(null);
                            setInputText('');
                          }}
                          className="w-full"
                        >
                          <Icon name="X" size={18} className="mr-2" />
                          Выбрать другой файл
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="text">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Вставьте текст для перевода..."
                      className="w-full h-64 p-4 border-2 border-purple-200 rounded-2xl resize-none focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Исходный язык
                  </label>
                  <select 
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-white"
                  >
                    <option>Автоопределение</option>
                    <option>Русский</option>
                    <option>English</option>
                    <option>中文</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Целевой язык
                  </label>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-white"
                  >
                    <option>English</option>
                    <option>Русский</option>
                    <option>中文</option>
                    <option>Español</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isTranslating ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={24} />
                    Переводим...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" className="mr-2" size={24} />
                    Перевести текст
                  </>
                )}
              </Button>

              {translatedText && (
                <Card className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Icon name="CheckCircle" className="text-green-500" size={24} />
                      Результат перевода
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(translatedText);
                        toast({ title: 'Скопировано!' });
                      }}
                      className="bg-white hover:bg-purple-50"
                    >
                      <Icon name="Copy" size={16} className="mr-2" />
                      Копировать
                    </Button>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-purple-100">
                    <p className="text-gray-800 whitespace-pre-wrap">{translatedText}</p>
                  </div>
                </Card>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {[
                { icon: 'Zap', title: 'Мгновенно', desc: 'Перевод за секунды' },
                { icon: 'Shield', title: 'Безопасно', desc: 'Данные защищены' },
                { icon: 'Star', title: 'Точно', desc: 'AI-технологии' }
              ].map((feature, i) => (
                <Card key={i} className="p-6 text-center bg-white/60 backdrop-blur-sm border border-purple-100 hover:shadow-lg hover:border-purple-300 transition-all duration-300 animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Icon name={feature.icon as any} className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'о нас' && (
        <section className="pt-32 pb-20 px-6 animate-fade-in">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              О нас
            </h2>
            <Card className="p-10 bg-white/80 backdrop-blur-sm">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Мы команда экспертов в области искусственного интеллекта и машинного обучения, 
                создающая передовые решения для перевода документов.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Наша миссия — сделать языковые барьеры незаметными для бизнеса и частных лиц 
                по всему миру, используя мощь современных AI-технологий.
              </p>
            </Card>
          </div>
        </section>
      )}

      {activeSection === 'услуги' && (
        <section className="pt-32 pb-20 px-6 animate-fade-in">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Наши услуги
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: 'FileText', title: 'Перевод документов', desc: 'PDF, Word, Excel, PowerPoint' },
                { icon: 'Globe', title: 'Веб-контент', desc: 'Сайты и приложения' },
                { icon: 'BookOpen', title: 'Техническая документация', desc: 'Руководства и спецификации' },
                { icon: 'Mail', title: 'Email-переписка', desc: 'Деловая корреспонденция' }
              ].map((service, i) => (
                <Card key={i} className="p-8 bg-white/70 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl transition-all duration-300 animate-scale-in" style={{animationDelay: `${i * 100}ms`}}>
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Icon name={service.icon as any} className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'портфолио' && (
        <section className="pt-32 pb-20 px-6 animate-fade-in">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Портфолио
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="group overflow-hidden bg-white/70 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-400 transition-all duration-300 animate-scale-in" style={{animationDelay: `${item * 50}ms`}}>
                  <div className="h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Проект {item}</h3>
                    <p className="text-gray-600">Перевод документации</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'блог' && (
        <section className="pt-32 pb-20 px-6 animate-fade-in">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Блог
            </h2>
            <div className="space-y-6">
              {[
                { title: 'Как AI меняет индустрию переводов', date: '15 октября 2024' },
                { title: 'Топ-5 ошибок при переводе документов', date: '10 октября 2024' },
                { title: 'Будущее машинного перевода', date: '5 октября 2024' }
              ].map((post, i) => (
                <Card key={i} className="p-6 bg-white/70 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-400 hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                      <p className="text-sm text-gray-500">{post.date}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'faq' && (
        <section className="pt-32 pb-20 px-6 animate-fade-in">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Вопросы и ответы
            </h2>
            <Card className="p-8 bg-white/80 backdrop-blur-sm">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold">
                    Какие форматы документов вы поддерживаете?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Мы поддерживаем PDF, DOCX, XLSX, PPTX, TXT и многие другие форматы. 
                    Максимальный размер файла — 50MB.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-semibold">
                    Сколько времени занимает перевод?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Обычно перевод занимает от нескольких секунд до пары минут, 
                    в зависимости от размера документа.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-semibold">
                    Безопасны ли мои данные?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Да, все данные шифруются и удаляются после обработки. 
                    Мы соблюдаем GDPR и другие стандарты безопасности.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-semibold">
                    Какие языки вы поддерживаете?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    Мы поддерживаем более 100 языков, включая английский, русский, 
                    китайский, испанский, французский, немецкий и многие другие.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>
        </section>
      )}

      {activeSection === 'контакты' && (
        <section className="pt-32 pb-20 px-6 animate-fade-in">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Контакты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8 bg-white/80 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-6">Свяжитесь с нами</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <textarea
                    placeholder="Сообщение"
                    rows={4}
                    className="w-full p-3 border-2 border-purple-200 rounded-xl resize-none focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6">
                    Отправить
                  </Button>
                </form>
              </Card>

              <Card className="p-8 bg-white/80 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-6">Наши контакты</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Icon name="Mail" className="text-purple-600 mt-1" size={24} />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">info@aitranslator.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Icon name="Phone" className="text-purple-600 mt-1" size={24} />
                    <div>
                      <p className="font-medium">Телефон</p>
                      <p className="text-gray-600">+7 (495) 123-45-67</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Icon name="MapPin" className="text-purple-600 mt-1" size={24} />
                    <div>
                      <p className="font-medium">Адрес</p>
                      <p className="text-gray-600">Москва, ул. Примерная, 123</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-gradient-to-r from-purple-900 to-pink-900 text-white py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lg mb-4">© 2024 AI Translator. Все права защищены.</p>
          <div className="flex justify-center gap-6">
            {['Telegram', 'Twitter', 'Linkedin'].map((social) => (
              <Button key={social} variant="ghost" className="text-white hover:bg-white/20">
                <Icon name={social as any} size={24} />
              </Button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;