import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, Trash2, Loader2, Sparkles } from 'lucide-react';
import { chatApi } from '@/lib/api';
import { useCityStore } from '@/store/useCityStore';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: '你好呀 👋 我是「如意城市」AI 助手，可以帮你了解各城市的宜居情况、对比城市优劣、分析教育/医疗/就业等指标。有什么想问的尽管问我～',
};

// 根据当前城市生成快捷问题
function buildSuggestions(cityName?: string): string[] {
  if (cityName) {
    return [
      `${cityName}适合定居吗？`,
      `${cityName}的房价和薪资匹配吗？`,
      `${cityName}的优缺点是什么？`,
      `${cityName}适合什么样的人群？`,
    ];
  }
  return [
    '哪些城市最适合养老？',
    '房价最低的宜居城市有哪些？',
    '互联网行业去哪个城市发展好？',
    '帮我对比杭州和成都',
  ];
}

export default function AIAssistant() {
  const location = useLocation();
  const { getCityById } = useCityStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 检测当前是否在城市详情页，提取 cityId
  const currentCityId = (() => {
    const match = location.pathname.match(/^\/city\/(.+)$/);
    return match ? match[1] : undefined;
  })();

  const currentCity = currentCityId ? getCityById(currentCityId) : undefined;
  const currentCityName = currentCity?.name;

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, scrollToBottom]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 切换城市时重置对话（仅当用户已在对话中时提示）
  const prevCityIdRef = useRef<string | undefined>(currentCityId);
  useEffect(() => {
    if (prevCityIdRef.current !== currentCityId && isOpen && messages.length > 1) {
      setMessages([{
        role: 'assistant',
        content: currentCityName
          ? `已切换到「${currentCityName}」🏙️ 现在你可以问我关于这座城市的问题～`
          : '已返回城市列表 🏠 现在你可以问我任何关于城市宜居的问题～',
      }]);
    }
    prevCityIdRef.current = currentCityId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCityId, currentCityName]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // 只传最近 10 条对话，避免上下文过长
      const history = newMessages.slice(-10);
      const { reply } = await chatApi.sendMessage(history, currentCityId);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'AI 服务暂时不可用';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ 抱歉，出错了：${errorMsg}\n\n请稍后再试，或检查后端 AI 配置是否正确。`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  const suggestions = buildSuggestions(currentCityName);

  return (
    <>
      {/* 悬浮触发按钮 */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group',
          isOpen
            ? 'bg-slate-600 hover:bg-slate-700 rotate-90'
            : 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:scale-105 active:scale-100'
        )}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
        title={isOpen ? '关闭' : 'AI 助手'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-400 rounded-full ring-2 ring-white animate-pulse" />
            {/* 悬浮提示 */}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              AI 城市助手
            </span>
          </>
        )}
      </button>

      {/* 对话窗口 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in-up">
          {/* 头部 */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  AI 城市助手
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-white/80">
                  {currentCityName ? `当前城市：${currentCityName}` : '随时问我城市问题'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="清空对话"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex gap-2 items-start',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full',
                    msg.role === 'user'
                      ? 'bg-slate-300'
                      : 'bg-gradient-to-br from-emerald-400 to-teal-500'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-slate-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-sm'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* 加载中提示 */}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                    <span className="text-xs text-slate-400">正在思考...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 快捷问题 */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <div className="text-[11px] text-slate-400 mb-1.5">💡 试试问我：</div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区 */}
          <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={currentCityName ? `问问关于${currentCityName}的事...` : '问我任何城市问题...'}
              className="flex-1 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-100"
              aria-label="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
