using MediatR;
using RilquiChat.Domain.Interfaces;

namespace RilquiChat.Application.Common.Behaviors;

public class TransactionBehavior<TRequest, TResponse>(IUnitOfWork unitOfWork) 
    : IPipelineBehavior<TRequest, TResponse> 
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (request.GetType().Name.EndsWith("Query"))
        {
            return await next(cancellationToken);
        }

        try
        {
            await unitOfWork.BeginTransactionAsync();
            
            var response = await next(cancellationToken);
            
            await unitOfWork.CommitTransactionAsync();
            return response;
        }
        catch
        {
            await unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }
}