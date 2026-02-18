/**
 * Generic payload cho mọi event trong hệ thống.
 * - Key là string (tên field), value là unknown vì mỗi loại event có schema khác nhau.
 * - Dùng object serializable để dễ gửi qua message broker / HTTP.
 */
export type EventPayload = Record<string, unknown>;

/**
 * Domain event cơ bản, đại diện cho một sự kiện nghiệp vụ đã xảy ra.
 *
 * @typeParam TType - Tên/loại event, ví dụ: "user.registered", "auth.token.revoked".
 * @typeParam TPayload - Dữ liệu đi kèm event, phải là một EventPayload.
 */
export interface DomainEvent<TType extends string, TPayload extends EventPayload> {
  /** Tên/loại event để subscriber biết cách xử lý. */
  type: TType;
  /** Dữ liệu chi tiết của event (id user, email, v.v.). */
  payload: TPayload;
  /** Thời điểm event xảy ra (ISO string), dùng cho logging/audit/replay. */
  occurredAt: string;
}

/**
 * Metadata phục vụ việc trace luồng request/event qua nhiều service.
 */
export interface EventMetadata {
  /** Id dùng để gom các event/request cùng một luồng nghiệp vụ. */
  correlationId?: string;
  /** Id của event/request đã sinh ra event hiện tại (cha → con). */
  causationId?: string;
  /** Version schema của event, hỗ trợ nâng cấp/bẻ gãy schema có kiểm soát. */
  version?: number;
}

/**
 * Event chuẩn bị được publish ra ngoài (ví dụ gửi lên RabbitMQ/Kafka).
 * Vẫn là một DomainEvent nhưng có thêm metadata để bên nhận trace được nguồn gốc.
 */
export interface OutboundEvent<
  TType extends string,
  TPayload extends EventPayload
> extends DomainEvent<TType, TPayload> {
  metadata?: EventMetadata;
}

/**
 * Event mà service nhận vào từ outside world (queue, topic, v.v.).
 * Shape giống OutboundEvent để có thể chuyển tiếp/xử lý thống nhất.
 */
export interface InboundEvent<
  TType extends string,
  TPayload extends EventPayload
> extends DomainEvent<TType, TPayload> {
  metadata?: EventMetadata;
}

